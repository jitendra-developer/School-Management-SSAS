import { z } from 'zod'

const optionalString = z.string().trim().optional().nullable()

const routeBase = {
  route_name: z.string().trim().min(1, 'Route name is required'),
  vehicle_number: optionalString,
  driver_name: optionalString,
  driver_phone: optionalString,
}

export const createRouteSchema = z.object(routeBase)
export const updateRouteSchema = z.object(routeBase).partial()

export const assignStudentSchema = z.object({
  route_id: z.string().trim().min(1, 'Route is required'),
  student_id: z.string().trim().min(1, 'Student is required'),
  pickup_point: optionalString,
  pickup_time: optionalString,
  drop_time: optionalString,
})

export const updateAssignmentSchema = z.object({
  pickup_point: optionalString,
  pickup_time: optionalString,
  drop_time: optionalString,
})
