import { db } from '../db/connection'
import { sessions } from '../models/Session'
import { eq, and, lt } from 'drizzle-orm'
import { CreateSessionData, SessionData } from '../models/Session'
import { SESSION_CONFIG } from '../constants/constants'

export const createSession = async ({
  user_Id,
  currentDB = 'default',
  token,
  sessionData,
  ipAddress,
  userAgent
}: {
  user_Id: number
  currentDB?: string
  token?: string
  sessionData: SessionData
  ipAddress?: string
  userAgent?: string
}) => {
  try {
    const expiresAt = new Date(Date.now() + SESSION_CONFIG.EXPIRES_IN)

    const sessionPayload: CreateSessionData = {
      userId: user_Id,
      token: token,
      currentDB,
      sessionData: sessionData,
      ipAddress,
      userAgent,
      expiresAt
    }
    await db.delete(sessions).where(eq(sessions.userId, user_Id))

    const [session] = await db
      .insert(sessions)
      .values(sessionPayload)
      .returning()

    return session
  } catch (error) {
    console.error('Session creation error:', error)
    throw new Error('Failed to create session')
  }
}

export const getSession = async ({
  sessionId,
  user_Id
}: {
  sessionId?: number
  user_Id?: number
}) => {
  try {
    if (!sessionId && !user_Id) {
      throw new Error('Either sessionId or user_Id must be provided')
    }

    const query = db
      .select()
      .from(sessions)
      .where(
        and(
          sessionId ? eq(sessions.id, sessionId) : eq(sessions.userId, user_Id!),
          eq(sessions.isActive, true)
        )
      )
      .limit(1)

    const result = await query
    return result[0] || null
  } catch (error) {
    console.error('Session retrieval error:', error)
    return null
  }
}

export const updateSession = async (
  sessionId: number,
  data: Partial<SessionData>
) => {
  try {
    const [updatedSession] = await db
      .update(sessions)
      .set({
        sessionData: data,
        updatedAt: new Date()
      })
      .where(eq(sessions.id, sessionId))
      .returning()

    return updatedSession
  } catch (error) {
    console.error('Session update error:', error)
    throw new Error('Failed to update session')
  }
}

export const invalidateSession = async (sessionId: number) => {
  try {
    await db
      .update(sessions)
      .set({
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(sessions.id, sessionId))

    return true
  } catch (error) {
    console.error('Session invalidation error:', error)
    return false
  }
}

export const invalidateUserSessions = async (userId: number) => {
  try {
    await db
      .update(sessions)
      .set({
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(sessions.userId, userId))

    return true
  } catch (error) {
    console.error('User sessions invalidation error:', error)
    return false
  }
}

export const cleanupExpiredSessions = async () => {
  try {
    const result = await db
      .update(sessions)
      .set({
        isActive: false,
        updatedAt: new Date()
      })
      .where(and(
        eq(sessions.isActive, true),
        // Sessions where expiresAt is less than current time
        lt(sessions.expiresAt, new Date())
      ))

    console.log(`Cleaned up expired sessions`)
    return true
  } catch (error) {
    console.error('Session cleanup error:', error)
    return false
  }
}
