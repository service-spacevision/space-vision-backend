import { Elysia, t } from 'elysia'
import { cookie } from '@elysiajs/cookie'
import { UserController } from '../../app/controllers/userControllers/userController'
import { checkUser } from '../../app/middlewares/permissions'
import { UpdateProfileSchema, ChangePasswordSchema, DeleteAccountSchema, UserResponseSchema } from '../../app/models/User'

const permission = {
  "GET_/api/users/profile": "read_user_profile",
  "PUT_/api/users/profile": "update_user_profile",
  "POST_/api/users/change-password": "change_password",
  "DELETE_/api/users/account": "delete_user_account",
  "PATCH_/api/users/update-by-id": "update_user_by_id",
  "GET_/api/users/all": "get_all_users",
  "GET_/api/users/all-under-org": "get_all_users_under_org"
}

const userRoute = new Elysia({ prefix: '/api/users' })
  .use(cookie())
  .get('/profile', UserController.getProfile, {
    beforeHandle: [checkUser(permission["GET_/api/users/profile"])],
    tags: ['User'],
    detail: {
      summary: 'Get user profile',
      description: 'Retrieve current user profile information',
      operationId: 'getUserProfile',
    },
  })

  .put('/profile', UserController.updateProfile, {
    beforeHandle: [checkUser(permission['PUT_/api/users/profile'])],
    body: UpdateProfileSchema,
    tags: ['User'],
    detail: {
      summary: 'Update user profile',
      description: 'Update current user profile information',
      operationId: 'updateUserProfile',
    }
  })
  .get('/all', UserController.getAllUsers, {
    beforeHandle: [checkUser(permission['GET_/api/users/all'])],
    tags: ['User'],
    detail: {
      summary: 'Get all users',
      description: 'Retrieve all users',
      operationId: 'getAllUsers',
    },
  })
  .get('/all-under-org', UserController.getAllUsersUnderOrg, {
    beforeHandle: [checkUser(permission['GET_/api/users/all-under-org'])],
    tags: ['User'],
    query: t.Object({
      currentPage: t.Optional(t.String({ default: '1' })),
      pageSize: t.Optional(t.String({ default: '10' })),
      all: t.Optional(t.String({ default: 'false' })),
    }),
    detail: {
      summary: 'Get all users under organization',
      description: 'Retrieve all users under organization',
      operationId: 'getAllUsersUnderOrg',
    },
  })

  .post('/change-password', UserController.changePassword, {
    beforeHandle: [checkUser(permission['POST_/api/users/change-password'])],
    body: ChangePasswordSchema,
    tags: ['User'],
    detail: {
      summary: 'Change password',
      description: 'Change user password',
      operationId: 'changePassword',
    }
  })

  .delete('/account', UserController.deleteAccount, {
    beforeHandle: [checkUser(permission['DELETE_/api/users/account'])],
    body: DeleteAccountSchema,
    tags: ['User'],
    detail: {
      summary: 'Delete user account',
      description: 'Delete current user account',
      operationId: 'deleteUserAccount',
    }
  })
  .patch('/update-by-id', UserController.updateUserProfileById, {
    beforeHandle: [checkUser(permission["PATCH_/api/users/update-by-id"])],
    query: t.Object({
      id: t.String({
        description: 'User ID'
      })
    }),
    body: UpdateProfileSchema,
    tags: ['User'],
    detail: {
      summary: 'Update user profile by id',
      description: 'Update current user profile information',
      operationId: 'updateUserProfileById',
    }
  })

export { permission }
export default userRoute