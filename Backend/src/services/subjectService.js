import { prisma } from '../config/db.js'

export const subjectService = {
  async getAll(school_id) {
    const subjects = await prisma.subject.findMany({
      where: { school_id },
      orderBy: { name: 'asc' },
      select: { name: true },
      distinct: ['name'],
    })
    return subjects.map((s) => s.name)
  },

  async getByClass(class_id, school_id) {
    const subjects = await prisma.subject.findMany({
      where: { class_id, school_id },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, class_id: true },
    })
    return subjects
  },

  async bulkCreate(class_id, names, school_id) {
    const cls = await prisma.class.findFirst({ where: { id: class_id, school_id } })
    if (!cls) {
      const err = new Error('Class not found')
      err.statusCode = 404
      throw err
    }

    const data = names.map((name) => ({ school_id, class_id, name: name.trim() }))
    const existing = await prisma.subject.findMany({
      where: { class_id, school_id },
      select: { name: true },
    })
    const existingNames = new Set(existing.map((s) => s.name.toLowerCase()))

    const newSubjects = data.filter((s) => !existingNames.has(s.name.toLowerCase()))

    if (newSubjects.length > 0) {
      await prisma.subject.createMany({ data: newSubjects })
    }

    return this.getByClass(class_id, school_id)
  },

  async remove(id, school_id) {
    const subject = await prisma.subject.findFirst({ where: { id, school_id } })
    if (!subject) {
      const err = new Error('Subject not found')
      err.statusCode = 404
      throw err
    }
    await prisma.subject.delete({ where: { id } })
  },
}
