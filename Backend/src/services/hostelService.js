import { prisma } from '../config/db.js'

export const hostelService = {
  async getHostels(school_id) {
    const hostels = await prisma.hostel.findMany({
      where: { school_id },
      include: {
        _count: { select: { rooms: true } },
      },
      orderBy: { name: 'asc' },
    })
    return hostels
  },

  async createHostel(data, school_id) {
    const hostel = await prisma.hostel.create({
      data: { ...data, school_id },
    })
    return hostel
  },

  async updateHostel(id, data, school_id) {
    const hostel = await prisma.hostel.findFirst({ where: { id, school_id } })
    if (!hostel) {
      const err = new Error('Hostel not found')
      err.statusCode = 404
      throw err
    }
    const updated = await prisma.hostel.update({
      where: { id },
      data,
    })
    return updated
  },

  async deleteHostel(id, school_id) {
    const hostel = await prisma.hostel.findFirst({ where: { id, school_id } })
    if (!hostel) {
      const err = new Error('Hostel not found')
      err.statusCode = 404
      throw err
    }
    await prisma.hostel.delete({ where: { id } })
  },

  async getRooms(hostel_id, school_id) {
    const hostel = await prisma.hostel.findFirst({ where: { id: hostel_id, school_id } })
    if (!hostel) {
      const err = new Error('Hostel not found')
      err.statusCode = 404
      throw err
    }
    const rooms = await prisma.room.findMany({
      where: { hostel_id },
      orderBy: { room_number: 'asc' },
    })
    return rooms
  },

  async createRoom(data, school_id) {
    const hostel = await prisma.hostel.findFirst({ where: { id: data.hostel_id, school_id } })
    if (!hostel) {
      const err = new Error('Hostel not found')
      err.statusCode = 404
      throw err
    }
    const room = await prisma.room.create({
      data,
    })
    await prisma.hostel.update({
      where: { id: data.hostel_id },
      data: { total_rooms: { increment: 1 } },
    })
    return room
  },

  async updateRoom(id, data, school_id) {
    const room = await prisma.room.findUnique({
      where: { id },
      include: { hostel: true },
    })
    if (!room || room.hostel.school_id !== school_id) {
      const err = new Error('Room not found')
      err.statusCode = 404
      throw err
    }
    const updated = await prisma.room.update({
      where: { id },
      data,
    })
    return updated
  },

  async deleteRoom(id, school_id) {
    const room = await prisma.room.findUnique({
      where: { id },
      include: { hostel: true },
    })
    if (!room || room.hostel.school_id !== school_id) {
      const err = new Error('Room not found')
      err.statusCode = 404
      throw err
    }
    await prisma.room.delete({ where: { id } })
    await prisma.hostel.update({
      where: { id: room.hostel_id },
      data: { total_rooms: { decrement: 1 } },
    })
  },

  async getAssignments(school_id, query = {}) {
    const { page = 1, limit = 20 } = query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const where = { school_id, check_out_date: null }

    const [assignments, total] = await Promise.all([
      prisma.roomAssignment.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          student: { select: { id: true, first_name: true, last_name: true } },
          room: {
            select: { id: true, room_number: true, hostel: { select: { id: true, name: true } } },
          },
        },
        orderBy: { check_in_date: 'desc' },
      }),
      prisma.roomAssignment.count({ where }),
    ])

    return { assignments, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) }
  },

  async assignStudent(data, school_id) {
    const room = await prisma.room.findUnique({ where: { id: data.room_id } })
    if (!room) {
      const err = new Error('Room not found')
      err.statusCode = 404
      throw err
    }
    if (room.occupants >= room.capacity) {
      const err = new Error('Room is full')
      err.statusCode = 400
      throw err
    }

    const assignment = await prisma.roomAssignment.create({
      data: { ...data, school_id },
      include: {
        student: { select: { id: true, first_name: true, last_name: true } },
        room: {
          select: { id: true, room_number: true, hostel: { select: { id: true, name: true } } },
        },
      },
    })
    await prisma.room.update({
      where: { id: data.room_id },
      data: { occupants: { increment: 1 } },
    })
    return assignment
  },

  async removeAssignment(id, school_id) {
    const assignment = await prisma.roomAssignment.findFirst({
      where: { id, school_id },
      include: { room: true },
    })
    if (!assignment) {
      const err = new Error('Assignment not found')
      err.statusCode = 404
      throw err
    }
    await prisma.roomAssignment.update({
      where: { id },
      data: { check_out_date: new Date() },
    })
    await prisma.room.update({
      where: { id: assignment.room_id },
      data: { occupants: { decrement: 1 } },
    })
  },

  async updateAssignment(id, { check_in_date, check_out_date }, school_id) {
    const assignment = await prisma.roomAssignment.findFirst({ where: { id, school_id } })
    if (!assignment) {
      const err = new Error('Assignment not found')
      err.statusCode = 404
      throw err
    }

    const data = {}
    if (check_in_date) data.check_in_date = new Date(check_in_date)

    let occupancyDelta = 0
    if (check_out_date !== undefined) {
      const wasCheckedOut = !!assignment.check_out_date
      const willBeCheckedOut = !!check_out_date
      data.check_out_date = check_out_date ? new Date(check_out_date) : null
      if (!wasCheckedOut && willBeCheckedOut) occupancyDelta = -1
      else if (wasCheckedOut && !willBeCheckedOut) occupancyDelta = 1
    }

    const updated = await prisma.roomAssignment.update({
      where: { id },
      data,
      include: {
        student: { select: { id: true, first_name: true, last_name: true } },
        room: {
          select: { id: true, room_number: true, hostel: { select: { id: true, name: true } } },
        },
      },
    })

    if (occupancyDelta !== 0) {
      await prisma.room.update({
        where: { id: assignment.room_id },
        data: { occupants: { increment: occupancyDelta } },
      })
    }

    return updated
  },
}
