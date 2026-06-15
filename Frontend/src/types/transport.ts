export interface TransportRoute {
  id: string
  route_name: string
  vehicle_number?: string
  driver_name?: string
  driver_phone?: string
  _count?: { assignments: number }
}

export interface TransportAssignment {
  id: string
  route_id: string
  student_id: string
  pickup_point?: string
  pickup_time?: string
  drop_time?: string
  route?: TransportRoute
  student?: { id: string; first_name: string; last_name: string }
}
