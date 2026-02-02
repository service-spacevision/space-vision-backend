# Forgot Password API Setup Guide

This guide explains how to set up and use the forgot password functionality in the Space Vision backend.

## Features

- **Request Password Reset**: Send a password reset email with a secure token
- **Reset Password**: Reset password using the token from email
- **Security**: Tokens expire after 1 hour
- **Email Enumeration Protection**: Always returns success message regardless of whether email exists
- **Beautiful Email Templates**: Professional HTML email with responsive design

## Installation

1. **Install Dependencies**

```bash
bun install
# or
npm install
```

This will install `nodemailer` and `@types/nodemailer` which are already added to `package.json`.

## Configuration

### 1. Environment Variables

Add the following to your `.env` file:

```env
# Email Configuration for Password Reset
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM_NAME=Space Vision
EMAIL_FROM_EMAIL=your-email@gmail.com

# Frontend URL for password reset links
FRONTEND_URL=http://localhost:3000
```

### 2. Gmail Setup (if using Gmail)

If you're using Gmail, you need to create an **App Password**:

1. Go to your Google Account settings
2. Navigate to Security → 2-Step Verification (enable if not already)
3. Scroll down to "App passwords"
4. Generate a new app password for "Mail"
5. Use this password in `EMAIL_PASSWORD` (not your regular Gmail password)

### 3. Other Email Providers

For other SMTP providers, update the configuration:

**Outlook/Office365:**
```env
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

**SendGrid:**
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

**AWS SES:**
```env
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-ses-smtp-username
EMAIL_PASSWORD=your-ses-smtp-password
```

## API Endpoints

### 1. Request Password Reset

**Endpoint:** `POST /api/auth/forgot-password`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

**Notes:**
- Always returns success to prevent email enumeration
- Only sends email if user exists and is active
- Token expires in 1 hour

### 2. Reset Password

**Endpoint:** `POST /api/auth/reset-password`

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "newSecurePassword123"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Password has been reset successfully. You can now login with your new password."
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Invalid or expired reset token"
}
```

## Frontend Integration

### 1. Forgot Password Page

```typescript
const handleForgotPassword = async (email: string) => {
  const response = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  
  const data = await response.json();
  // Show success message
  alert(data.message);
};
```

### 2. Reset Password Page

The frontend should have a route like `/reset-password?token=xxx` that extracts the token from URL:

```typescript
const handleResetPassword = async (token: string, newPassword: string) => {
  const response = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Redirect to login page
    window.location.href = '/login';
  } else {
    // Show error message
    alert(data.message);
  }
};
```

## Database Schema

The following fields are already in the `users` table:

```typescript
passwordResetToken: varchar('password_reset_token', { length: 255 })
passwordResetExpires: timestamp('password_reset_expires')
```

No migration is needed as these fields already exist in your schema.

## Testing

### 1. Test Email Configuration

You can verify your email configuration by checking the server logs when starting the application. The email service will verify the connection on startup.

### 2. Manual Testing

1. **Request Reset:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/forgot-password \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com"}'
   ```

2. **Check Email:** Look for the reset email in the inbox

3. **Reset Password:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/reset-password \
     -H "Content-Type: application/json" \
     -d '{"token":"token-from-email","newPassword":"newPassword123"}'
   ```

## Security Considerations

1. **Token Expiration**: Tokens expire after 1 hour
2. **One-Time Use**: Token is cleared after successful password reset
3. **Email Enumeration Protection**: Always returns success message
4. **Secure Token Generation**: Uses crypto.randomBytes(32) for token generation
5. **Password Hashing**: Passwords are hashed with bcrypt (12 rounds)
6. **HTTPS Required**: In production, ensure HTTPS is used for all endpoints

## Troubleshooting

### Email Not Sending

1. **Check credentials**: Verify EMAIL_USER and EMAIL_PASSWORD
2. **Check firewall**: Ensure port 587 is not blocked
3. **Check logs**: Look for error messages in server console
4. **Test SMTP**: Use a tool like telnet to test SMTP connection

### Token Invalid/Expired

1. **Check expiration**: Tokens expire after 1 hour
2. **Check database**: Verify token exists in database
3. **One-time use**: Token is cleared after use

### Gmail Specific Issues

1. **Use App Password**: Don't use regular Gmail password
2. **Enable 2FA**: Required for app passwords
3. **Less Secure Apps**: Not needed with app passwords

## File Structure

```
src/
├── app/
│   ├── controllers/
│   │   └── authControllers/
│   │       ├── authController.ts (added requestPasswordReset & resetPassword methods)
│   │       └── functions/
│   │           ├── requestPasswordReset.ts (new)
│   │           └── resetPassword.ts (new)
│   └── utils/
│       └── emailService.ts (new)
└── routes/
    └── authRoute/
        └── authRoute.ts (added forgot-password & reset-password routes)
```

## Support

For issues or questions, please check:
- Server logs for detailed error messages
- Email provider documentation
- SMTP connection settings
