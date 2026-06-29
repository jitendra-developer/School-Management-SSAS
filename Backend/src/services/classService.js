import XLSX from 'xlsx'
import { prisma } from '../config/db.js'

export const classService = {
  async create(data, school_id) {
    const cls = await prisma.class.create({
      data: { ...data, school_id },
      include: { _count: { select: { students: true } } },
    })
    return cls
  },

  async getAll(school_id) {
    const classes = await prisma.class.findMany({
      where: { school_id },
      include: { _count: { select: { students: true } } },
      orderBy: { name: 'asc' },
    })
    return classes
  },

  async getById(id, school_id) {
    const cls = await prisma.class.findFirst({
      where: { id, school_id },
      include: { _count: { select: { students: true } } },
    })
    if (!cls) {
      const err = new Error('Class not found')
      err.statusCode = 404
      throw err
    }
    return cls
  },

  async update(id, data, school_id) {
    const cls = await prisma.class.findFirst({
      where: { id, school_id },
    })
    if (!cls) {
      const err = new Error('Class not found')
      err.statusCode = 404
      throw err
    }
    const updated = await prisma.class.update({
      where: { id },
      data: {
        ...data,
        fee_amount: data.fee_amount !== undefined ? parseFloat(data.fee_amount) : undefined,
      },
      include: { _count: { select: { students: true } } },
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
