import api from './api'
import type { ApiResponse } from '@/types/api'
import type { Hostel, Room, RoomAssignment } from '@/types/hostel'

export const hostelService = {
  getHostels: (params?: Record<string, string>) =>
    api.get<ApiResponse<{ hostels: Hostel[]; total: number }>>('/hostel', { params }),
  createHostel: (data: Record<string, unknown>) =>
    api.post<ApiResponse<Hostel>>('/hostel', data),
  updateHostel: (id: string, data: Record<string, unknown>) =>
    api.put<ApiResponse<Hostel>>(`/hostel/${id}`, data),
  deleteHostel: (id: string) =>
    api.delete<ApiResponse<null>>(`/hostel/${id}`),
  getRooms: (hostelId: string, params?: Record<string, string>) =>
    api.get<ApiResponse<{ rooms: Room[]; total: number }>>(`/hostel/${hostelId}/rooms`, { params }),
  createRoom: (data: Record<string, unknown>) =>
    api.post<ApiResponse<Room>>('/hostel/rooms', data),
  updateRoom: (id: string, data: Record<string, unknown>) =>
    api.put<ApiResponse<Room>>(`/hostel/rooms/${id}`, data),
  deleteRoom: (id: string) =>
    api.delete<ApiResponse<null>>(`/hostel/rooms/${id}`),
  getAssignments: (params?: Record<string, string>) =>
    api.get<ApiResponse<{ assignments: RoomAssignment[]; total: number }>>('/hostel/assignments/all', { params }),
  assignStudent: (data: Record<string, unknown>) =>
    api.post<ApiResponse<RoomAssignment>>('/hostel/assign', data),
  updateAssignment: (id: string, data: Record<string, unknown>) =>
    api.put<ApiResponse<RoomAssignment>>(`/hostel/assignments/${id}`, data),
  removeAssignment: (id: string) =>
    api.delete<ApiResponse<null>>(`/hostel/assignments/${id}`),
}
