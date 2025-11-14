import { CustomContext } from '../../utils/types';
import { createOrganization_func } from './functions/createOrganization';
import { getOrganizations_func } from './functions/getOrganizations';
import { getOrganizationByName_func } from './functions/getOrganizationByName';
import { updateOrganization_func } from './functions/updateOrganization';
import { updateOrganizationByAdmin_func } from './functions/updateOrganizationByAdmin';
import { deleteOrganization_func } from './functions/deleteOrganization';
import { generateAccessToken_func } from './functions/generateAccessToken';
import getOrganizationUsers_func from './functions/getOrganizationUsers';

export class OrganizationController {
  static async create(ctx: CustomContext) {
    try {
      const result = await createOrganization_func({ data: ctx.body as any });
      ctx.set.status = result?.success ? 201 : 400;
      return result;
    } catch (err) {
      ctx.set.status = 500;
      return {
        success: false,
        message: 'Internal server error while creating organization',
      };
    }
  }

  static async list(ctx: CustomContext) {
    try {
      const { query } = ctx;
      const search = query?.search || '';
      const pagination = {
        currentPage: Number(query?.currentPage || query?.page) || 1,
        pageSize: Number(query?.pageSize) || 10,
        all: query?.all || 'false',
      };
      const result = await getOrganizations_func({ pagination, search });
      ctx.set.status = result?.success ? 200 : 404;
      return result;
    } catch (err) {
      ctx.set.status = 500;
      return {
        success: false,
        message: 'Internal server error while fetching organizations',
      };
    }
  }

  static async getUsers(ctx: CustomContext) {
    try {
      const organizationId = Number(ctx.params?.id);
      if (isNaN(organizationId)) {
        ctx.set.status = 400;
        return { success: false, message: 'Invalid organization ID' };
      }

      const { currentPage, pageSize, all, search } = ctx.query;
      const result = await getOrganizationUsers_func({
        organizationId,
        pagination: {
          currentPage: currentPage ? Number(currentPage) : 1,
          pageSize: pageSize ? Number(pageSize) : 10,
          all: all || 'false',
        },
        search: search || '',
      });

      ctx.set.status = result.success ? 200 : 400;
      return result;
    } catch (error) {
      console.error('Error in getUsers:', error);
      ctx.set.status = 500;
      return {
        success: false,
        message: 'Internal server error while fetching organization users',
      };
    }
  }

  static async getByName(ctx: CustomContext) {
    try {
      const { name, id } = ctx.query;
      const result = await getOrganizationByName_func({
        name,
        id: id ? parseInt(id, 10) : undefined,
      });

      ctx.set.status = result.success ? 200 : 404;
      return result;
    } catch (error) {
      console.error('Error in getByName:', error);
      ctx.set.status = 500;
      return {
        success: false,
        message: 'Internal server error while fetching organization',
      };
    }
  }

  static async update(ctx: CustomContext) {
    try {
      const name = (ctx.query as any)?.name as string;
      const user = ctx.user;
      const result = await updateOrganization_func({
        name,
        data: ctx.body as any,
        userId: user?.id,
      });
      ctx.set.status = result?.success ? 200 : 404;
      return result;
    } catch (err) {
      ctx.set.status = 500;
      return {
        success: false,
        message: 'Internal server error while updating organization',
      };
    }
  }

  static async updateByAdmin(ctx: CustomContext) {
    try {
      const organizationId = (ctx.params as any)?.id as string;
      const user = ctx.user;
      const result = await updateOrganizationByAdmin_func({
        organizationId,
        data: ctx.body as any,
        userId: user?.id,
      });
      ctx.set.status = result?.success ? 200 : 404;
      return result;
    } catch (err) {
      ctx.set.status = 500;
      return {
        success: false,
        message: 'Internal server error while updating organization by admin',
      };
    }
  }

  static async delete(ctx: CustomContext) {
    try {
      const name = (ctx.query as any)?.name as string;
      const result = await deleteOrganization_func({ name });
      ctx.set.status = result?.success ? 200 : 404;
      return result;
    } catch (err) {
      ctx.set.status = 500;
      return {
        success: false,
        message: 'Internal server error while deleting organization',
      };
    }
  }

  static async generateAccessToken(ctx: CustomContext) {
    try {
      const { userId, organizationId } = ctx.body as any;
      const result = await generateAccessToken_func({ userId, organizationId });
      ctx.set.status = result?.success ? 200 : 400;
      return result;
    } catch (err) {
      ctx.set.status = 500;
      return {
        success: false,
        message: 'Internal server error while generating access token',
      };
    }
  }
}
