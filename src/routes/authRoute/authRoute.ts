import { Elysia, t } from 'elysia';
import { cookie } from '@elysiajs/cookie';
import { AuthController } from '../../app/controllers/authControllers/authController';
import { checkUser } from '../../app/middlewares/permissions';
import {
  SignUpSchema,
  SignInSchema,
  UserResponseSchema,
} from '../../app/models/User';

const permission = {
  'POST_/api/auth/signup': 'sign_up_user',
  'POST_/api/auth/logout': 'api_logout',
  'POST_/api/auth/verify-mfa': 'verify_mfa_token',
};

const authRoute = new Elysia({ prefix: '/api/auth' })
  .use(cookie())
  .post('/signup', AuthController.signUpUser, {
    beforeHandle: [checkUser(permission['POST_/api/auth/signup'])],
    body: SignUpSchema,
    tags: ['Authentication'],
    detail: {
      summary: 'Sign up a new user',
      description: 'Create a new user account with email and optional password',
      operationId: 'signUpUser',
    },
  })

  .post('/login', AuthController.signIn, {
    body: SignInSchema,
    tags: ['Authentication'],
    detail: {
      summary: 'User login',
      description: 'Authenticate user with email and password',
      operationId: 'signInUser',
    },
  })

  .post('/logout', AuthController.signOut, {
    beforeHandle: [checkUser(permission['POST_/api/auth/logout'])],
    tags: ['Authentication'],
    detail: {
      summary: 'User logout',
      description: 'Log out user and invalidate session',
      operationId: 'signOutUser',
    },
  })

  .post('/verify-mfa', AuthController.verifyMfaToken, {
    beforeHandle: [checkUser(permission['POST_/api/auth/verify-mfa'])],
    body: t.Object({
      mfaCode: t.String(),
    }),
    tags: ['Authentication'],
    detail: {
      summary: 'Verify MFA token',
      description: 'Verify the MFA code provided by the user',
      operationId: 'verifyMfaToken',
    },
  });

// .post('/refresh', AuthController.refreshToken, {
//   beforeHandle: [checkUser()],
//   response: {
//     200: t.Object({
//       success: t.Boolean(),
//       message: t.String(),
//       data: t.Optional(t.Object({
//         user: UserResponseSchema
//       }))
//     })
//   },
//   tags: ['Authentication'],
//   summary: 'Refresh token',
//   description: 'Refresh user authentication token'
// })

export { permission };
export default authRoute;
