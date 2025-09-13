import { CustomContext } from '../../utils/types'
import { createOrganization_func } from './functions/createOrganization'
import { getOrganizations_func } from './functions/getOrganizations'
import { getOrganizationByName_func } from './functions/getOrganizationByName'
import { updateOrganization_func } from './functions/updateOrganization'
import { deleteOrganization_func } from './functions/deleteOrganization'

export class OrganizationController {
  static async create(ctx: CustomContext) {
    try {
      const result = await createOrganization_func({ data: ctx.body as any })
      ctx.set.status = result?.success ? 201 : 400
      return result
    } catch (err) {
      ctx.set.status = 500
      return { success: false, message: 'Internal server error while creating organization' }
    }
  }

  static async list(ctx: CustomContext) {
    try {
      const { query } = ctx
      const pagination = {
        currentPage: Number(query?.currentPage || query?.page) || 1,
        pageSize: Number(query?.pageSize) || 10,
        all: query?.all || 'false'
      }
      const result = await getOrganizations_func({ pagination })
      ctx.set.status = result?.success ? 200 : 404
      return result
    } catch (err) {
      ctx.set.status = 500
      return { success: false, message: 'Internal server error while fetching organizations' }
    }
  }

  static async getByName(ctx: CustomContext) {
    try {
      const name = (ctx.query as any)?.name as string
      const result = await getOrganizationByName_func({ name })
      ctx.set.status = result?.success ? 200 : 404
      return result
    } catch (err) {
      ctx.set.status = 500
      return { success: false, message: 'Internal server error while fetching organization' }
    }
  }

  static async update(ctx: CustomContext) {
    try {
      const name = (ctx.query as any)?.name as string
      const result = await updateOrganization_func({ name, data: ctx.body as any })
      ctx.set.status = result?.success ? 200 : 404
      return result
    } catch (err) {
      ctx.set.status = 500
      return { success: false, message: 'Internal server error while updating organization' }
    }
  }

  static async delete(ctx: CustomContext) {
    try {
      const name = (ctx.query as any)?.name as string
      const result = await deleteOrganization_func({ name })
      ctx.set.status = result?.success ? 200 : 404
      return result
    } catch (err) {
      ctx.set.status = 500
      return { success: false, message: 'Internal server error while deleting organization' }
    }
  }
}

