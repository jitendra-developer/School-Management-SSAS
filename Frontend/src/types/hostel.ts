export interface Hostel {
  id: string
  name: string
  warden_name?: string
  warden_phone?: string
  total_rooms: number
  _count?: { rooms: number; assignments?: number }
}

export interface Room {
  id: string
  hostel_id: string
  room_number: string
  capacity: number
  occupants: number
  hostel?: Hostel
}

export interface RoomAssignment {
  id: string
  room_id: string
  student_id: string
  check_in_date: string
  check_out_date?: string
  room?: Room & { hostel?: Hostel }
  student?: { id: string; first_name: string; last_name: string }
}
