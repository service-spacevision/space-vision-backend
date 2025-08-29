import { db } from '../db/connection'
import { sessions } from '../models/Session'
import { eq, and } from 'drizzle-orm'
import { CreateSessionData, SessionData } from '../models/Session'
import { SESSION_CONFIG } from '../constants/constants'

export const createSession = async ({
  user_Id,
  currentDB = 'default',
  sessionData,
  ipAddress,
  userAgent
}: {
  user_Id: string
  currentDB?: string
  sessionData: SessionData
  ipAddress?: string
  userAgent?: string
}) => {
  try {
    const expiresAt = new Date(Date.now() + SESSION_CONFIG.EXPIRES_IN)
    
    const sessionPayload: CreateSessionData = {
      userId: user_Id,
      currentDB,
      sessionData: sessionData,
      ipAddress,
      userAgent,
      expiresAt
    }

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
  sessionId?: string
  user_Id?: string
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
  sessionId: string, 
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

export const invalidateSession = async (sessionId: string) => {
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

export const invalidateUserSessions = async (userId: string) => {
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
        eq(sessions.expiresAt, new Date())
      ))

    console.log(`Cleaned up expired sessions`)
    return true
  } catch (error) {
    console.error('Session cleanup error:', error)
    return false
  }
}