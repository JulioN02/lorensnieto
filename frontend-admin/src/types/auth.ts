export const UserRole = {
  Admin: 'admin',
  Partner: 'partner',
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export interface User {
  id: string
  email: string
  role: UserRole
  name: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export type LoginResponse = User
