import { CustomContext } from '../../utils/types'
import { createPermission_func } from './functions/createPermission'
import { getPermissions_func } from './functions/getPermissions'
import { getPermissionById_func } from './functions/getPermissionById'
import { updatePermission_func } from './functions/updatePermission'
import { deletePermission_func } from './functions/deletePermission'

export class PermissionController {
  static async create(ctx: CustomContext) {
    try {
      const result = await createPermission_func({ data: ctx.body as any })
      ctx.set.status = result?.success ? 201 : 400
      return result
    } catch (err) {
      ctx.set.status = 500
      return { success: false, message: 'Internal server error while creating permission' }
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
      const result = await getPermissions_func({ pagination })
      ctx.set.status = result?.success ? 200 : 404
      return result
    } catch (err) {
      ctx.set.status = 500
      return { success: false, message: 'Internal server error while fetching permissions' }
    }
  }

  static async getById(ctx: CustomContext) {
    try {
      const id = Number((ctx.query as any)?.id)
      const result = await getPermissionById_func({ id })
      ctx.set.status = result?.success ? 200 : 404
      return result
    } catch (err) {
      ctx.set.status = 500
      return { success: false, message: 'Internal server error while fetching permission' }
    }
  }

  static async update(ctx: CustomContext) {
    try {
      const id = Number((ctx.query as any)?.id)
      const result = await updatePermission_func({ id, data: ctx.body as any })
      ctx.set.status = result?.success ? 200 : 404
      return result
    } catch (err) {
      ctx.set.status = 500
      return { success: false, message: 'Internal server error while updating permission' }
    }
  }

  static async delete(ctx: CustomContext) {
    try {
      const id = Number((ctx.query as any)?.id)
      const result = await deletePermission_func({ id })
      ctx.set.status = result?.success ? 200 : 404
      return result
    } catch (err) {
      ctx.set.status = 500
      return { success: false, message: 'Internal server error while deleting permission' }
    }
  }
}

