import { CustomContext } from '../../utils/types'
import { createUserRole_func } from './functions/createUserRole'
import { getUserRoles_func } from './functions/getUserRoles'
import { getUserRoleById_func } from './functions/getUserRoleById'
import { getLoggedUserRole_func } from './functions/getLoggedUserRole'
import { updateUserRole_func } from './functions/updateUserRole'
import { deleteUserRole_func } from './functions/deleteUserRole'

export class UserRoleController {
  static async createRole(ctx: CustomContext) {
    try {
      const { body } = ctx
      const user = (ctx as any).user

      const result = await createUserRole_func({
        data: {
          ...(body as any),
          createdBy: user?.id,
          organizationName: (body as any)?.organizationName ?? user?.organizationName,
        } as any
      })

      ctx.set.status = result?.success === true ? 201 : 400
      return result
    } catch (err: any) {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while creating role'
      }
    }
  }

  static async getRoles(ctx: CustomContext) {
    try {
      const { query } = ctx
      const includeInactive = query?.includeInactive === 'true'
      const pagination = {
        currentPage: Number(query?.page) || 1,
        pageSize: Number(query?.pageSize) || 10,
        all: query?.all || "false"
      }
      const result = await getUserRoles_func({ includeInactive, pagination })

      ctx.set.status = result?.success === true ? 200 : 404
      return result
    } catch (err: any) {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while fetching roles'
      }
    }
  }

  static async getRoleById(ctx: CustomContext) {
    try {
      const { query } = ctx
      const roleId = query.id

      if (!roleId) {
        ctx.set.status = 400
        return {
          success: false,
          message: 'Role ID is required'
        }
      }

      const result = await getUserRoleById_func({ roleId })

      ctx.set.status = result?.success === true ? 200 : 404
      return result
    } catch (err: any) {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while fetching role'
      }
    }
  }

  static async updateRole(ctx: CustomContext) {
    try {
      const { query, body } = ctx
      const roleId = query.id

      if (!roleId) {
        ctx.set.status = 400
        return {
          success: false,
          message: 'Role ID is required'
        }
      }

      const result = await updateUserRole_func({
        roleId,
        userInfo: (ctx as any).user,
        data: body as any
      })

      ctx.set.status = result?.success === true ? 200 : 400
      return result
    } catch (err: any) {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while updating role'
      }
    }
  }

  static async getLoggedUserRole(ctx: CustomContext) {
    try {
      const reqObject = {
        user: (ctx as any).user
      }

      const result = await getLoggedUserRole_func({ reqObject })

      ctx.set.status = result?.success === true ? 200 : 404
      return result
    } catch (err: any) {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while fetching logged user role'
      }
    }
  }

  static async deleteRole(ctx: CustomContext) {
    try {
      const { query } = ctx
      const roleId = query.id

      if (!roleId) {
        ctx.set.status = 400
        return {
          success: false,
          message: 'Role ID is required'
        }
      }

      const result = await deleteUserRole_func({ roleId })

      ctx.set.status = result?.success === true ? 200 : 400
      return result
    } catch (err: any) {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while deleting role'
      }
    }
  }
}
