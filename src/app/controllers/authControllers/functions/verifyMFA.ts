import * as OTPAuth from "otpauth";
import { eq } from "drizzle-orm";
import { AuthUser } from '../../../utils/types';
import { db } from "../../../db/connection"
import { users } from '../../../models/User';
import { sessions } from '../../../models/Session';

export const generateTOTP = (secret: string, label?: string) => {
  return new OTPAuth.TOTP({
    issuer: "Space Vision",
    label: label || "Space Vision",
    algorithm: "SHA1",
    digits: 6,
    period: 30, // 30 second
    secret: secret // OTPAuth.Secret
  })
}
export const verifyMfaToken_func = async ({
  code,
  session,
  sessionId,
}: {
  session: AuthUser,
  code: string,
  sessionId: number
}) => {
  try {

    const [findUser] = await db.select({
      mfaSecret: users.mfaSecret
    }).from(users).where(eq(users.id, parseInt(session.id)))

    if (!findUser?.mfaSecret) {
      return {
        success: false,
        message: "MFA not configured for this user"
      }
    }

    const totp = generateTOTP(findUser.mfaSecret)

    const validateOTP = totp.validate({
      token: code,
      window: 1
    })

    if (validateOTP === null) {
      return {
        success: false,
        message: "Invalid code"
      }
    }

    // Update session to mark MFA as verified
    await db.update(sessions)
      .set({
        mfaVerified: true,
        updatedAt: new Date()
      })
      .where(eq(sessions.id, sessionId))

    return {
      success: true,
      message: "MFA verified successfully"
    }

  } catch (err: any) {
    console.log("err", err);
    return {
      success: false,
      message: err.message || "Failed to verify MFA code"
    }
  }
}