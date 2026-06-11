import api from './api'
import type { ApiResponse } from '@/types/api'
import type { Admin, UpdateProfilePayload } from '@/types/auth'

export const profileService = {
  getProfile: () => api.get<ApiResponse<{ admin: Admin }>>('/auth/me'),

  updateProfile: (payload: UpdateProfilePayload) =>
    api.put<ApiResponse<{ admin: Admin }>>('/auth/profile', payload),

  uploadImage: (file: File) => {
    const form = new FormData()
    form.append('profile_image', file)
    return api.post<ApiResponse<{ admin: Admin }>>('/auth/profile/image', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
