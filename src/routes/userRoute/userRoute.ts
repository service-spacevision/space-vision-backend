import { Elysia, t } from 'elysia'
import { UserController } from '../../app/controllers/userControllers/userController'
import { checkUser } from '../../app/middlewares/permissions'
import { UpdateProfileSchema, ChangePasswordSchema, DeleteAccountSchema, UserResponseSchema } from '../../app/models/User'

const permission = {
  "GET_/api/users/profile": "read_user_profile",
  "PUT_/api/users/profile": "update_user_profile",
  "POST_/api/users/change-password": "change_password",
  "DELETE_/api/users/account": "delete_user_account"
}

const userRoute = new Elysia({ prefix: '/api/users' })
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
    beforeHandle: [checkUser('update_user_profile')],
    body: UpdateProfileSchema,
    tags: ['User'],
    detail: {
      summary: 'Update user profile',
      description: 'Update current user profile information',
      operationId: 'updateUserProfile',
    }
  })

  .post('/change-password', UserController.changePassword, {
    beforeHandle: [checkUser('change_password')],
    body: ChangePasswordSchema,
    tags: ['User'],
    detail: {
      summary: 'Change password',
      description: 'Change user password',
      operationId: 'changePassword',
    }
  })

  .delete('/account', UserController.deleteAccount, {
    beforeHandle: [checkUser('delete_user_account')],
    body: DeleteAccountSchema,
    tags: ['User'],
    detail: {
      summary: 'Delete user account',
      description: 'Delete current user account',
      operationId: 'deleteUserAccount',
    }
  })

export default userRoute