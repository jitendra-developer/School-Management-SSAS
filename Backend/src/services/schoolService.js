import { prisma } from '../config/db.js'

export const schoolService = {
  async updateSchool(adminId, schoolId, data) {
    const admin = await prisma.admin.findUnique({ where: { id: adminId } })
    if (!admin || admin.school_id !== schoolId) {
      const err = new Error('Unauthorized to update this school')
      err.statusCode = 403
      throw err
    }

    const school = await prisma.school.update({
      where: { id: schoolId },
      data: {
        ...(data.school_name && { school_name: data.school_name }),
        ...(data.email && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.address !== undefined && { address: data.address }),
      },
      select: {
        id: true,
        school_name: true,
        email: true,
        phone: true,
        address: true,
        logo: true,
      },
    })

    return school
  },
}
