import api from './api'
import type { ApiResponse } from '@/types/api'
import type { School } from '@/types/auth'

export const settingsService = {
  updateSchool: (payload: Partial<Pick<School, 'school_name' | 'email' | 'phone' | 'address'>>) =>
    api.put<ApiResponse<School>>('/school/update', payload),
}
