import nodemailer from 'nodemailer';

// Email configuration
const EMAIL_CONFIG = {
  HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
  PORT: parseInt(process.env.EMAIL_PORT || '587'),
  SECURE: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  USER: process.env.EMAIL_USER,
  PASSWORD: process.env.EMAIL_PASSWORD,
  FROM_NAME: process.env.EMAIL_FROM_NAME || 'Space Vision',
  FROM_EMAIL: process.env.EMAIL_FROM_EMAIL,
};

// Frontend URL for reset link
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Create reusable transporter
const createTransporter = () => {
  if (!EMAIL_CONFIG.USER || !EMAIL_CONFIG.PASSWORD) {
    throw new Error(
      'Email configuration is missing. Please set EMAIL_USER and EMAIL_PASSWORD in .env file'
    );
  }

  return nodemailer.createTransport({
    host: EMAIL_CONFIG.HOST,
    port: EMAIL_CONFIG.PORT,
    secure: EMAIL_CONFIG.SECURE,
    auth: {
      user: EMAIL_CONFIG.USER,
      pass: EMAIL_CONFIG.PASSWORD,
    },
  });
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async ({
  email,
  fullName,
  resetToken,
}: {
  email: string;
  fullName: string;
  resetToken: string;
}) => {
  try {
    const transporter = createTransporter();
    const resetLink = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"${EMAIL_CONFIG.FROM_NAME}" <${EMAIL_CONFIG.FROM_EMAIL}>`,
      to: email,
      subject: 'Password Reset Request - Space Vision',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px 40px; text-align: center; background-color: #4F46E5; border-radius: 8px 8px 0 0;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Space Vision</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Password Reset Request</h2>
                      
                      <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.5;">
                        Hello ${fullName},
                      </p>
                      
                      <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.5;">
                        We received a request to reset your password. Click the button below to create a new password:
                      </p>
                      
                      <table role="presentation" style="margin: 30px 0;">
                        <tr>
                          <td style="border-radius: 4px; background-color: #4F46E5;">
                            <a href="${resetLink}" target="_blank" style="display: inline-block; padding: 14px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 4px;">
                              Reset Password
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 20px 0; color: #666666; font-size: 14px; line-height: 1.5;">
                        Or copy and paste this link into your browser:
                      </p>
                      
                      <p style="margin: 0 0 20px 0; padding: 12px; background-color: #f8f8f8; border-radius: 4px; word-break: break-all; font-size: 14px; color: #4F46E5;">
                        ${resetLink}
                      </p>
                      
                      <p style="margin: 20px 0 0 0; color: #666666; font-size: 14px; line-height: 1.5;">
                        <strong>This link will expire in 1 hour.</strong>
                      </p>
                      
                      <p style="margin: 20px 0 0 0; color: #666666; font-size: 14px; line-height: 1.5;">
                        If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; background-color: #f8f8f8; border-radius: 0 0 8px 8px; text-align: center;">
                      <p style="margin: 0; color: #999999; font-size: 12px; line-height: 1.5;">
                        This is an automated message, please do not reply to this email.
                      </p>
                      <p style="margin: 10px 0 0 0; color: #999999; font-size: 12px;">
                        &copy; ${new Date().getFullYear()} Space Vision. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `
        Password Reset Request
        
        Hello ${fullName},
        
        We received a request to reset your password. Click the link below to create a new password:
        
        ${resetLink}
        
        This link will expire in 1 hour.
        
        If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
        
        ---
        This is an automated message, please do not reply to this email.
        © ${new Date().getFullYear()} Space Vision. All rights reserved.
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error('Error sending password reset email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Verify email configuration
 */
export const verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email server is ready to send messages');
    return true;
  } catch (error: any) {
    console.error('❌ Email configuration error:', error.message);
    return false;
  }
};
