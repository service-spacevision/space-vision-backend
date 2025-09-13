import { CustomContext } from '../../utils/types'
import { createRolesPermission_func } from './functions/createRolesPermission'
import { getRolesPermissions_func } from './functions/getRolesPermissions'
import { getRolesPermissionById_func } from './functions/getRolesPermissionById'
import { updateRolesPermission_func } from './functions/updateRolesPermission'
import { deleteRolesPermission_func } from './functions/deleteRolesPermission'

export class RolesPermissionController {
  static async create(ctx: CustomContext) {
    try {
      const result = await createRolesPermission_func({ data: ctx.body as any })
      ctx.set.status = result?.success ? 201 : 400
      return result
    } catch (err) {
      ctx.set.status = 500
      return { success: false, message: 'Internal server error while creating roles_permission' }
    }
  }

  static async list(ctx: CustomContext) {
    try {
      const { query } = ctx
      const pagination = {
        currentPage: Number(query?.page || query?.currentPage) || 1,
        pageSize: Number(query?.pageSize) || 10,
        all: query?.all || 'false'
      }
      const result = await getRolesPermissions_func({ pagination })
      ctx.set.status = result?.success ? 200 : 404
      return result
    } catch (err) {
      ctx.set.status = 500
      return { success: false, message: 'Internal server error while fetching roles_permission' }
    }
  }

  static async getById(ctx: CustomContext) {
    try {
      const id = Number((ctx.query as any)?.id)
      const result = await getRolesPermissionById_func({ id })
      ctx.set.status = result?.success ? 200 : 404
      return result
    } catch (err) {
      ctx.set.status = 500
      return { success: false, message: 'Internal server error while fetching roles_permission' }
    }
  }

  static async update(ctx: CustomContext) {
    try {
      const id = Number((ctx.query as any)?.id)
      const result = await updateRolesPermission_func({ id, data: ctx.body as any })
      ctx.set.status = result?.success ? 200 : 404
      return result
    } catch (err) {
      ctx.set.status = 500
      return { success: false, message: 'Internal server error while updating roles_permission' }
    }
  }

  static async delete(ctx: CustomContext) {
    try {
      const id = Number((ctx.query as any)?.id)
      const result = await deleteRolesPermission_func({ id })
      ctx.set.status = result?.success ? 200 : 404
      return result
    } catch (err) {
      ctx.set.status = 500
      return { success: false, message: 'Internal server error while deleting roles_permission' }
    }
  }
}

