import bcrypt from 'bcryptjs'
import XLSX from 'xlsx'
import { prisma } from '../config/db.js'
import { emailService } from './emailService.js'

const SALT_ROUNDS = 12

const generateTeacherPassword = (firstName) => {
  const randomDigits = Math.floor(1000 + Math.random() * 9000).toString()
  return `${firstName}${randomDigits}`
}

const teacherSelect = { id: true, first_name: true, last_name: true, email: true }

export const classService = {
  async create(data, school_id) {
    const { teacher_id, subjects, ...classData } = data
    classData.name = (classData.name || '').trim()
    if (classData.section) classData.section = classData.section.trim()

    const existing = await prisma.class.findFirst({
      where: {
        school_id,
        name: { equals: classData.name, mode: 'insensitive' },
        section: classData.section
          ? { equals: classData.section, mode: 'insensitive' }
          : null,
      },
    })
    if (existing) {
      const err = new Error(
        `A class "${classData.name}${classData.section ? ` (${classData.section})` : ''}" already exists`
      )
      err.statusCode = 409
      throw err
    }

    let teacher = null
    if (teacher_id) {
      teacher = await prisma.teacher.findFirst({ where: { id: teacher_id, school_id } })
      if (!teacher) {
        const err = new Error('Teacher not found')
        err.statusCode = 404
        throw err
      }
      if (teacher.class_id) {
        const err = new Error('This teacher is already assigned as class teacher of another class')
        err.statusCode = 400
        throw err
      }
      if (!teacher.email) {
        const err = new Error('Teacher must have an email address to be assigned as class teacher')
        err.statusCode = 400
        throw err
      }
    }

    const cls = await prisma.class.create({
      data: { ...classData, school_id },
      include: { _count: { select: { students: true } } },
    })

    if (teacher) {
      const password = generateTeacherPassword(teacher.first_name)
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

      await prisma.teacher.update({
        where: { id: teacher_id },
        data: { class_id: cls.id, password: hashedPassword },
      })

      const school = await prisma.school.findUnique({
        where: { id: school_id },
        select: { school_name: true, email: true },
      })

      await emailService.sendTeacherWelcomeEmail(teacher, school, password)
    }

    if (subjects && Array.isArray(subjects) && subjects.length > 0) {
      const subjectData = subjects
        .filter((s) => s.trim())
        .map((name) => ({ school_id, class_id: cls.id, name: name.trim() }))
      if (subjectData.length > 0) {
        await prisma.subject.createMany({ data: subjectData })
      }
    }

    return prisma.class.findUnique({
      where: { id: cls.id },
      include: {
        _count: { select: { students: true } },
        teachers: { take: 1, select: teacherSelect },
        subjects: { select: { id: true, name: true } },
      },
    })
  },

  async getAll(school_id) {
    const classes = await prisma.class.findMany({
      where: { school_id },
      include: {
        _count: { select: { students: true } },
        teachers: { take: 1, select: teacherSelect },
        subjects: { select: { id: true, name: true } },
      },
      orderBy: { name: 'asc' },
    })
    return classes
  },

  async getById(id, school_id) {
    const cls = await prisma.class.findFirst({
      where: { id, school_id },
      include: {
        _count: { select: { students: true } },
        teachers: { take: 1, select: teacherSelect },
        subjects: { select: { id: true, name: true } },
      },
    })
    if (!cls) {
      const err = new Error('Class not found')
      err.statusCode = 404
      throw err
    }
    return cls
  },

  async update(id, data, school_id) {
    const existing = await prisma.class.findFirst({
      where: { id, school_id },
      include: { teachers: { take: 1, select: teacherSelect } },
    })
    if (!existing) {
      const err = new Error('Class not found')
      err.statusCode = 404
      throw err
    }

    const currentTeacher = existing.teachers[0] || null

    if ('teacher_id' in data) {
      const newTeacherId = data.teacher_id || null

      if (newTeacherId !== (currentTeacher?.id || null)) {
        if (currentTeacher) {
          await prisma.teacher.update({
            where: { id: currentTeacher.id },
            data: { class_id: null },
          })

          const school = await prisma.school.findUnique({
            where: { id: school_id },
            select: { school_name: true, email: true },
          })

          try {
            await emailService.sendTeacherRemovalEmail(
              currentTeacher,
              school,
              `${existing.name}${existing.section ? ` (${existing.section})` : ''}`
            )
          } catch {
            // Email failure should not block the update
          }
        }

        if (newTeacherId) {
          const newTeacher = await prisma.teacher.findFirst({
            where: { id: newTeacherId, school_id },
          })
          if (!newTeacher) {
            const err = new Error('Teacher not found')
            err.statusCode = 404
            throw err
          }
          if (newTeacher.class_id && newTeacher.class_id !== id) {
            const err = new Error('This teacher is already assigned as class teacher of another class')
            err.statusCode = 400
            throw err
          }
          if (!newTeacher.email) {
            const err = new Error('Teacher must have an email address to be assigned as class teacher')
            err.statusCode = 400
            throw err
          }

          const password = generateTeacherPassword(newTeacher.first_name)
          const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

          await prisma.teacher.update({
            where: { id: newTeacherId },
            data: { class_id: id, password: hashedPassword },
          })

          const school = await prisma.school.findUnique({
            where: { id: school_id },
            select: { school_name: true, email: true },
          })

          await emailService.sendTeacherWelcomeEmail(newTeacher, school, password)
        }
      }
    }

    const { teacher_id, subjects, ...updateData } = data
    if (updateData.name) updateData.name = updateData.name.trim()
    if (updateData.section) updateData.section = updateData.section.trim()

    const dupName = updateData.name || existing.name
    const dupSection = 'section' in updateData ? updateData.section : existing.section
    const dupWhere = {
      school_id,
      id: { not: id },
      name: { equals: dupName, mode: 'insensitive' },
    }
    if (dupSection) {
      dupWhere.section = { equals: dupSection, mode: 'insensitive' }
    } else {
      dupWhere.section = null
    }
    const duplicate = await prisma.class.findFirst({ where: dupWhere })
    if (duplicate) {
      const err = new Error(
        `A class "${dupName}${dupSection ? ` (${dupSection})` : ''}" already exists`
      )
      err.statusCode = 409
      throw err
    }

    if (subjects && Array.isArray(subjects)) {
      await prisma.subject.deleteMany({ where: { class_id: id, school_id } })
      const subjectData = subjects
        .filter((s) => s.trim())
        .map((name) => ({ school_id, class_id: id, name: name.trim() }))
      if (subjectData.length > 0) {
        await prisma.subject.createMany({ data: subjectData })
      }
    }

    const updated = await prisma.class.update({
      where: { id },
      data: {
        ...updateData,
        fee_amount: data.fee_amount !== undefined ? parseFloat(data.fee_amount) : undefined,
      },
      include: {
        _count: { select: { students: true } },
        teachers: { take: 1, select: teacherSelect },
        subjects: { select: { id: true, name: true } },
      },
    })
    return updated
  },

  async remove(id, school_id) {
    const cls = await prisma.class.findFirst({
      where: { id, school_id },
      include: { _count: { select: { students: true } } },
    })
    if (!cls) {
      const err = new Error('Class not found')
      err.statusCode = 404
      throw err
    }
    await prisma.class.delete({ where: { id } })
    return cls
  },

  async getStudents(id, school_id, query = {}) {
    await this.getById(id, school_id)

    const { status, search, page = 1, limit = 50 } = query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const where = { school_id, class_id: id }
    if (status) where.status = status
    if (search) {
      where.OR = [
        { first_name: { contains: search, mode: 'insensitive' } },
        { last_name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { first_name: 'asc' },
        include: { _count: { select: { student_attendance: true } } },
      }),
      prisma.student.count({ where }),
    ])

    const studentIds = students.map((s) => s.id)
    const presentCounts = studentIds.length
      ? await prisma.studentAttendance.groupBy({
          by: ['student_id'],
          where: { student_id: { in: studentIds }, status: 'present' },
          _count: { id: true },
        })
      : []

    const presentMap = Object.fromEntries(
      presentCounts.map((r) => [r.student_id, r._count.id])
    )

    const studentsWithAttendance = students.map((s) => ({
      ...s,
      attendance_percentage:
        s._count.student_attendance > 0
          ? Math.round(((presentMap[s.id] || 0) / s._count.student_attendance) * 100)
          : null,
    }))

    return { students: studentsWithAttendance, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) }
  },

  async bulkUploadStudents(id, school_id, file) {
    await this.getById(id, school_id)

    const workbook = XLSX.read(file.buffer, { type: 'buffer', cellDates: true })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })

    if (!rows.length) {
      const err = new Error('The uploaded file is empty')
      err.statusCode = 400
      throw err
    }

    const normalizeKey = (k) => k.toLowerCase().replace(/[\s_-]+/g, '_').trim()

    const requiredFields = ['student_name', 'roll_no', 'parent_name', 'parent_number', 'gender', 'dob', 'enrollment_date']
    const fieldAliases = {
      student_name: ['student_name', 'studentname', 'name', 'full_name', 'fullname'],
      first_name: ['first_name', 'firstname', 'fname'],
      last_name: ['last_name', 'lastname', 'lname'],
      roll_no: ['roll_no', 'rollno', 'roll_number', 'rollnumber'],
      parent_name: ['parent_name', 'parentname', 'father_name', 'mother_name'],
      parent_number: ['parent_number', 'parentnumber', 'parent_phone', 'parentphone', 'parent_mobile'],
      gender: ['gender'],
      dob: ['dob', 'date_of_birth', 'dateofbirth', 'birth_date'],
      enrollment_date: ['enrollment_date', 'enrollmentdate', 'date_of_enrollment', 'enrolled_on'],
    }

    const findColumn = (row, aliases) => {
      const keys = Object.keys(row).map(normalizeKey)
      for (const alias of aliases) {
        const idx = keys.indexOf(alias)
        if (idx !== -1) return Object.keys(row)[idx]
      }
      return null
    }

    const parseDateValue = (val) => {
      if (!val) return null
      if (val instanceof Date && !isNaN(val.getTime())) return val
      if (typeof val === 'number') {
        const excelEpoch = new Date(1899, 11, 30)
        const d = new Date(excelEpoch.getTime() + val * 86400000)
        return isNaN(d.getTime()) ? null : d
      }
      const d = new Date(String(val))
      return isNaN(d.getTime()) ? null : d
    }

    const headerRow = rows[0]
    for (const field of requiredFields) {
      const col = findColumn(headerRow, fieldAliases[field])
      if (!col) {
        const err = new Error(`Missing required column: "${field}". Expected one of: ${fieldAliases[field].join(', ')}`)
        err.statusCode = 400
        throw err
      }
    }

    const colMap = {}
    for (const field of [...requiredFields, 'email', 'phone', 'address', 'dob', 'first_name', 'last_name', 'enrollment_date']) {
      const aliases = fieldAliases[field] || [field]
      colMap[field] = findColumn(headerRow, aliases)
    }

    const students = []
    const errors = []

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rowNum = i + 2

      const rawName = String(row[colMap.student_name] || '').trim()
      const firstNameCol = colMap.first_name && String(row[colMap.first_name] || '').trim()
      const lastNameCol = colMap.last_name && String(row[colMap.last_name] || '').trim()
      const rollNo = String(row[colMap.roll_no] || '').trim()
      const parentName = String(row[colMap.parent_name] || '').trim()
      const parentNumber = String(row[colMap.parent_number] || '').trim()
      const gender = String(row[colMap.gender] || '').trim().toLowerCase()
      const dobVal = row[colMap.dob]
      const enrollmentDateVal = row[colMap.enrollment_date]

      const missing = []
      if (!rawName && !firstNameCol) missing.push('student_name or first_name')
      if (!rollNo) missing.push('roll_no')
      if (!parentName) missing.push('parent_name')
      if (!parentNumber) missing.push('parent_number')
      if (!gender) missing.push('gender')
      if (!dobVal) missing.push('dob')
      if (!enrollmentDateVal) missing.push('enrollment_date')

      if (missing.length) {
        errors.push(`Row ${rowNum}: missing required fields: ${missing.join(', ')}`)
        continue
      }

      let first_name, last_name
      if (firstNameCol) {
        first_name = firstNameCol
        last_name = lastNameCol || ''
      } else {
        const spaceIdx = rawName.indexOf(' ')
        first_name = spaceIdx === -1 ? rawName : rawName.slice(0, spaceIdx).trim()
        last_name = spaceIdx === -1 ? '' : rawName.slice(spaceIdx + 1).trim()
      }

      students.push({
        school_id,
        class_id: id,
        first_name,
        last_name,
        roll_number: rollNo,
        parent_name: parentName,
        parent_phone: parentNumber,
        gender: ['male', 'female', 'other'].includes(gender) ? gender : 'other',
        email: colMap.email ? String(row[colMap.email] || '').trim() || null : null,
        phone: colMap.phone ? String(row[colMap.phone] || '').trim() || null : null,
        address: colMap.address ? String(row[colMap.address] || '').trim() || null : null,
        dob: parseDateValue(dobVal),
        enrollment_date: parseDateValue(enrollmentDateVal),
      })
    }

    if (!students.length) {
      const err = new Error(errors.length ? `No valid rows to import. ${errors[0]}` : 'No valid rows found')
      err.statusCode = 400
      throw err
    }

    await prisma.student.createMany({ data: students })

    return { imported: students.length, errors }
  },
}
