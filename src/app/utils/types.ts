import { Context } from 'elysia'

export interface CustomContext extends Context {
  user?: AuthUser
  file?: any
}

export interface ReqObjectType {
  body?: any
  user: AuthUser
}

export interface AuthUser {
  id: string
  email: string
  role?: string
  fullName?: string
  username?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
  errors?: Record<string, string[]>
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
export interface IPagination {
  currentPage: number;
  pageSize: number;
  all?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export type AuthType = 'local' | 'oauth' | 'ldap'
export type UserRole = 'admin' | 'user' | 'moderator'