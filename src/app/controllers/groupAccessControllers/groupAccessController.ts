import { CustomContext } from '../../utils/types'
import { getGroupAccess_func } from './functions/getGroupAccess'
import { createGroupAccess_func } from './functions/createGroupAccess'
import { updateGroupAccess_func } from './functions/updateGroupAccess'
import { deleteGroupAccess_func } from './functions/deleteGroupAccess'

export class GroupAccessController {
  static async getGroupAccess(ctx: CustomContext) {
    try {
      const { query } = ctx
      const user = ctx.user!
      
      const pagination = {
        currentPage: Number(query?.currentPage) || 1,
        pageSize: Number(query?.pageSize) || 10,
        all: query?.all || "false"
      }

      const result = await getGroupAccess_func({
        reqObject: { user },
        query: query as any,
        pagination
      })

      ctx.set.status = result?.success === true ? 200 : 404
      return result
    } catch (err: any) {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while fetching group access'
      }
    }
  }

  static async createGroupAccess(ctx: CustomContext) {
    try {
      const { body } = ctx
      const user = ctx.user!

      const result = await createGroupAccess_func({
        reqObject: { user },
        data: body as any
      })

      ctx.set.status = result?.success === true ? 201 : 400
      return result
    } catch (err: any) {
      ctx.set.status = 500
      return {
        success: false,
        message: 'Internal server error while creating group access'
      }
    }
  }

  static async updateGroupAccess(ctx: CustomContext) {
    try {
      const { query, body } = ctx;
      const user = ctx.user!;
      
      // Type assertion for the request body
      const requestBody = body as { groupIds?: any[] };

      if (!requestBody.groupIds || !Array.isArray(requestBody.groupIds)) {
        ctx.set.status = 400;
        return {
          success: false,
          message: 'groupIds array is required in the request body'
        };
      }

      const result = await updateGroupAccess_func({
        reqObject: { user },
        query: { role: query.role as string },
        data: {
          groupIds: requestBody.groupIds.map((id: any) => parseInt(id)).filter((id: number) => !isNaN(id))
        }
      });

      ctx.set.status = result?.success === true ? 200 : 400;
      return result;
    } catch (err: any) {
      console.error('Error in updateGroupAccess:', err);
      ctx.set.status = 500;
      return {
        success: false,
        message: 'Internal server error while updating group access',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      };
    }
  }

  static async deleteGroupAccess(ctx: CustomContext) {
    try {
      const { query } = ctx;
      const user = ctx.user!;

      // Check if user is admin
      if (user.role !== 'admin') {
        ctx.set.status = 403;
        return {
          success: false,
          message: 'Unauthorized: Only admin users can delete group access',
        };
      }

      if (!query.role) {
        ctx.set.status = 400;
        return {
          success: false,
          message: 'Role ID is required for deletion',
        };
      }

      const roleId = parseInt(query.role as string);
      if (isNaN(roleId)) {
        ctx.set.status = 400;
        return {
          success: false,
          message: 'Invalid role ID',
        };
      }

      const result = await deleteGroupAccess_func({
        reqObject: { user },
        query: { role: roleId.toString() }
      });

      ctx.set.status = result?.success ? 200 : 400;
      return result;
    } catch (err: any) {
      console.error('Error in deleteGroupAccess:', err);
      ctx.set.status = 500;
      return {
        success: false,
        message: 'Internal server error while deleting group access',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      };
    }
  }
}