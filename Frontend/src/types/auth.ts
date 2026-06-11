export interface Admin {
  id: string
  school_id: string
  name: string
  email: string
  role: string
  created_at?: string
  school?: School
}

export interface School {
  id: string
  school_name: string
  email: string
  phone?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  school_name: string
  school_email: string
  phone?: string
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data: {
    admin: Admin
    school: School
    token: string
  }
}
