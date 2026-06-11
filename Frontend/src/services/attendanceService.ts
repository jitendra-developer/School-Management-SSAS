import api from './api'
import type { ApiResponse } from '@/types/api'
import type { AttendancePayload, DailyAttendance } from '@/types/attendance'

export const attendanceService = {
  mark: (data: AttendancePayload) =>
    api.post<ApiResponse<unknown>>('/attendance/mark', data),
  getByDate: (date: string, params?: Record<string, string>) =>
    api.get<ApiResponse<unknown>>(`/attendance/date/${date}`, { params }),
  getStudentRecords: (studentId: string, params?: Record<string, string>) =>
    api.get<ApiResponse<DailyAttendance[]>>(`/attendance/student/${studentId}`, { params }),
  getTeacherRecords: (teacherId: string, params?: Record<string, string>) =>
    api.get<ApiResponse<DailyAttendance[]>>(`/attendance/teacher/${teacherId}`, { params }),
}
