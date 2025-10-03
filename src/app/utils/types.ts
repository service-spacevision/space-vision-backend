import { Context } from 'elysia'
import { UserRole } from '../models/UserRole'
import { RolePermission } from '../models/RolePermission'

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
  sessionId?: Number
  email: string
  role?: UserRole
  permissions?: RolePermission
  fullName?: string
  username?: string
  organizationId?: number
  sessionInfo: {
    mfaEnabled?: boolean
    mfaVerified?: boolean
  }
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
export type UserRoleType = 'admin' | 'user' | 'moderator'