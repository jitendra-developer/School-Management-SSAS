import { z } from 'zod'

const optionalString = z.string().trim().optional().nullable()

const hostelBase = {
  name: z.string().trim().min(1, 'Hostel name is required'),
  warden_name: optionalString,
  warden_phone: optionalString,
}

export const createHostelSchema = z.object(hostelBase)
export const updateHostelSchema = z.object(hostelBase).partial()

const roomBase = {
  hostel_id: z.string().trim().min(1, 'Hostel is required'),
  room_number: z.string().trim().min(1, 'Room number is required'),
  capacity: z.coerce.number().optional(),
}

export const createRoomSchema = z.object(roomBase)
export const updateRoomSchema = z.object(roomBase).partial()

export const assignStudentSchema = z.object({
  room_id: z.string().trim().min(1, 'Room is required'),
  student_id: z.string().trim().min(1, 'Student is required'),
  check_in_date: optionalString,
})

export const updateAssignmentSchema = z.object({
  check_in_date: optionalString,
  check_out_date: optionalString,
})
