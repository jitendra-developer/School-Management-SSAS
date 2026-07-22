import { prisma } from '../config/db.js'

export const transportService = {
  async getRoutes(school_id) {
    const routes = await prisma.transportRoute.findMany({
      where: { school_id },
      include: {
        _count: { select: { assignments: true } },
      },
      orderBy: { route_name: 'asc' },
    })
    return routes
  },

  async createRoute(data, school_id) {
    const route = await prisma.transportRoute.create({
      data: { ...data, school_id },
    })
    return route
  },

  async updateRoute(id, data, school_id) {
    const route = await prisma.transportRoute.findFirst({ where: { id, school_id } })
    if (!route) {
      const err = new Error('Route not found')
      err.statusCode = 404
      throw err
    }
    const updated = await prisma.transportRoute.update({
      where: { id },
      data,
    })
    return updated
  },

  async deleteRoute(id, school_id) {
    const route = await prisma.transportRoute.findFirst({ where: { id, school_id } })
    if (!route) {
      const err = new Error('Route not found')
      err.statusCode = 404
      throw err
    }
    await prisma.transportRoute.delete({ where: { id } })
  },

  async getAssignments(school_id, query = {}) {
    const { page = 1, limit = 20 } = query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const where = { school_id }

    const [assignments, total] = await Promise.all([
      prisma.transportAssignment.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          student: { select: { id: true, first_name: true, last_name: true } },
          route: { select: { id: true, route_name: true, vehicle_number: true } },
        },
        orderBy: { created_at: 'desc' },
      }),
      prisma.transportAssignment.count({ where }),
    ])

    return { assignments, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) }
  },

  async assignStudent(data, school_id) {
    const assignment = await prisma.transportAssignment.create({
      data: { ...data, school_id },
      include: {
        student: { select: { id: true, first_name: true, last_name: true } },
        route: { select: { id: true, route_name: true } },
      },
    })
    return assignment
  },

  async removeAssignment(id, school_id) {
    const assignment = await prisma.transportAssignment.findFirst({ where: { id, school_id } })
    if (!assignment) {
      const err = new Error('Assignment not found')
      err.statusCode = 404
      throw err
    }
    await prisma.transportAssignment.delete({ where: { id } })
  },

  async updateAssignment(id, { pickup_point, pickup_time, drop_time }, school_id) {
    const assignment = await prisma.transportAssignment.findFirst({ where: { id, school_id } })
    if (!assignment) {
      const err = new Error('Assignment not found')
      err.statusCode = 404
      throw err
    }
    const updated = await prisma.transportAssignment.update({
      where: { id },
      data: { pickup_point, pickup_time, drop_time },
      include: {
        student: { select: { id: true, first_name: true, last_name: true } },
        route: { select: { id: true, route_name: true } },
      },
    })
    return updated
  },
}
