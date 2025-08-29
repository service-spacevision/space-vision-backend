export const BACKEND_ROUTES = {
  // Authentication routes
  AUTH: {
    BASE: '/api/auth',
    SIGNUP: '/signup',
    LOGIN: '/login',
    LOGOUT: '/logout',
    REFRESH: '/refresh',
    VERIFY_EMAIL: '/verify-email',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password'
  },
  
  // User routes
  USER: {
    BASE: '/api/users',
    PROFILE: '/profile',
    UPDATE_PROFILE: '/profile',
    DELETE_ACCOUNT: '/account',
    CHANGE_PASSWORD: '/change-password',
    ENABLE_MFA: '/mfa/enable',
    DISABLE_MFA: '/mfa/disable',
    VERIFY_MFA: '/mfa/verify'
  },
  
  // System routes
  SYSTEM: {
    BASE: '/api/system',
    HEALTH: '/health',
    STATUS: '/status',
    VERSION: '/version'
  }
} as const