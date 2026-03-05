import { eq } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { permissions } from '../../../models/Permission'
import { rolesPermission } from '../../../models/RolePermission'
import { userRoles } from '../../../models/UserRole'

// Import permissions from all route files
import { permission as authPermissions } from '../../../../routes/authRoute/authRoute'
import { permission as bluetideUsagePermissions } from '../../../../routes/bluetideUsageRoute/bluetideUsageRoute'
import { permission as groupAccessPermissions } from '../../../../routes/groupAccessRoute/groupAccessRoute'
import { permission as hrEmployeeProfilePermissions } from '../../../../routes/hrEmployeeProfileRoute/hrEmployeeProfileRoute'
import { permission as hrLeavePermissions } from '../../../../routes/hrLeaveRoute/hrLeaveRoute'
import { permission as hrShiftPermissions } from '../../../../routes/hrShiftRoute/hrShiftRoute'
import { permission as hrPolicyConfigPermissions } from '../../../../routes/hrPolicyConfigRoute/hrPolicyConfigRoute'
import { permission as hrTimeClockPermissions } from '../../../../routes/hrTimeClockRoute/hrTimeClockRoute'
import { permission as mikrotikUsagePermissions } from '../../../../routes/mikrotikUsageRoute/mikrotikUsageRoute'
import { permission as mikrotikVesselPermissions } from '../../../../routes/mikrotikVesselRoute/mikrotikVesselRoute'
import { permission as organizationPermissions } from '../../../../routes/organizationRoute/organizationRoute'
import { permission as permissionRoutePermissions } from '../../../../routes/permissionRoute/permissionRoute'
import { permission as pinManagementPermissions } from '../../../../routes/pinManagementRoute/pinManagementRoute'
import { permission as rolesPermissionPermissions } from '../../../../routes/rolesPermissionRoute/rolesPermissionRoute'
import { permission as starlinkUsagePermissions } from '../../../../routes/starlinkUsageRoute/starlinkUsageRoute'
import { permission as systemPermissions } from '../../../../routes/systemRoute/systemRoute'
import { permission as telephonyDidPermissions } from '../../../../routes/telephonyDidRoute/telephonyDidRoute'
import { permission as userPermissions } from '../../../../routes/userRoute/userRoute'
import { permission as userRolePermissions } from '../../../../routes/userRoleRoute/userRoleRoute'
import { permission as vesselGroupPermissions } from '../../../../routes/vesselGroupRoute/vesselGroupRoute'
import { permission as vesselPermissions } from '../../../../routes/vesselRoute/vesselRoute'

interface ExtractedPermission {
  method: string
  path: string
  code: string
  section: 'admin' | 'organization'
}

function gatherPermissionsFromExports(): ExtractedPermission[] {
  const sources: Array<{
    map: Record<string, string>
    section: 'admin' | 'organization'
  }> = [
    { map: authPermissions, section: 'organization' },
    { map: bluetideUsagePermissions, section: 'organization' },
    { map: groupAccessPermissions, section: 'organization' },
    { map: mikrotikUsagePermissions, section: 'organization' },
    { map: mikrotikVesselPermissions, section: 'organization' },
    { map: organizationPermissions, section: 'organization' },
    { map: permissionRoutePermissions, section: 'organization' },
    { map: pinManagementPermissions, section: 'organization' },
    { map: rolesPermissionPermissions, section: 'organization' },
    { map: starlinkUsagePermissions, section: 'organization' },
    { map: systemPermissions, section: 'organization' },
    { map: telephonyDidPermissions, section: 'organization' },
    { map: userRolePermissions, section: 'organization' },
    { map: userPermissions, section: 'organization' },
    { map: vesselGroupPermissions, section: 'organization' },
    { map: vesselPermissions, section: 'organization' },
    { map: hrEmployeeProfilePermissions, section: 'organization' },
    { map: hrTimeClockPermissions, section: 'organization' },
    { map: hrPolicyConfigPermissions, section: 'organization' },
    { map: hrLeavePermissions, section: 'organization' },
    { map: hrShiftPermissions, section: 'organization' },
  ]

  const items: ExtractedPermission[] = []

  for (const { map, section } of sources) {
    for (const [key, code] of Object.entries(map)) {
      const underscore = key.indexOf('_')
      if (underscore === -1) continue
      const method = key.slice(0, underscore)
      const routePath = key.slice(underscore + 1)
      items.push({ method, path: routePath, code, section })
    }
  }
  return items
}

function extractResourceAndAction(permissionCode: string): {
  resource: string
  action: string
} {
  const parts = permissionCode.split('_')
  if (parts.length < 2) {
    return { resource: 'unknown', action: permissionCode }
  }
  const action = parts[0]
  const resource = parts.slice(1).join('_')
  return { resource, action }
}

function normalizePermissionArray(value: unknown): string[] {
  if (!value) return []
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter((v) => v.length > 0)
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) {
        return parsed.map((v) => String(v).trim()).filter((v) => v.length > 0)
      }
    } catch {}
    return value
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v.length > 0)
  }
  return []
}

async function syncSystemRoleApiPermissions(codes: string[]) {
  if (!codes.length) return

  const allRoles = await db
    .select({
      id: userRoles.id,
      name: userRoles.name,
      isSystem: userRoles.isSystem,
    })
    .from(userRoles)

  const targetRoles = allRoles.filter((role) => {
    const roleName = String(role.name || '').toLowerCase()
    return role.isSystem === true || roleName === 'admin' || roleName === 'system'
  })

  for (const role of targetRoles) {
    const [existing] = await db
      .select()
      .from(rolesPermission)
      .where(eq(rolesPermission.roleId, Number(role.id)))
      .limit(1)

    const existingCodes = normalizePermissionArray(existing?.api_permissions)
    const mergedCodes = Array.from(new Set([...existingCodes, ...codes]))

    if (!existing) {
      await db.insert(rolesPermission).values({
        roleId: Number(role.id),
        api_permissions: mergedCodes,
        component_permissions: [],
        navigation_permissions: [],
      })
      console.log(`Created roles_permission for role: ${role.name}`)
      continue
    }

    const changed =
      mergedCodes.length !== existingCodes.length ||
      mergedCodes.some((code) => !existingCodes.includes(code))

    if (changed) {
      await db
        .update(rolesPermission)
        .set({
          api_permissions: mergedCodes,
          updatedAt: new Date(),
        })
        .where(eq(rolesPermission.roleId, Number(role.id)))
      console.log(`Updated API permissions for role: ${role.name}`)
    }
  }
}

export async function syncApiPermissions(): Promise<void> {
  try {
    console.log('Starting API permissions sync...')

    const extractedPermissions = gatherPermissionsFromExports()
    const uniquePermissions = extractedPermissions.reduce((acc, current) => {
      const exists = acc.find((item) => item.code === current.code)
      if (!exists) acc.push(current)
      return acc
    }, [] as ExtractedPermission[])

    console.log(
      `Found ${extractedPermissions.length} API permissions (${uniquePermissions.length} unique)`,
    )

    let syncedCount = 0
    let createdCount = 0
    let updatedCount = 0

    for (const { method, path, code, section } of uniquePermissions) {
      const { resource, action } = extractResourceAndAction(code)
      const [existingPermission] = await db
        .select()
        .from(permissions)
        .where(eq(permissions.name, code))
        .limit(1)

      const permissionData = {
        name: code,
        resource,
        action,
        category: 'api' as const,
        section,
        scope: 'organization' as const,
        description: `API permission for ${method} ${path}`,
      }

      if (!existingPermission) {
        await db.insert(permissions).values(permissionData)
        createdCount++
      } else {
        const needsUpdate =
          existingPermission.resource !== permissionData.resource ||
          existingPermission.action !== permissionData.action ||
          existingPermission.category !== permissionData.category ||
          existingPermission.section !== permissionData.section ||
          existingPermission.scope !== permissionData.scope ||
          existingPermission.description !== permissionData.description

        if (needsUpdate) {
          await db
            .update(permissions)
            .set({
              resource: permissionData.resource,
              action: permissionData.action,
              category: permissionData.category,
              section: permissionData.section,
              scope: permissionData.scope,
              description: permissionData.description,
              updatedAt: new Date(),
            })
            .where(eq(permissions.name, code))
          updatedCount++
        }
      }

      syncedCount++
    }

    const skippedCount = syncedCount - createdCount - updatedCount
    console.log(
      `API permissions sync completed: processed=${syncedCount}, created=${createdCount}, updated=${updatedCount}, unchanged=${skippedCount}`,
    )

    await syncSystemRoleApiPermissions(uniquePermissions.map((p) => p.code))
  } catch (error) {
    console.error('Failed to sync API permissions:', error)
    throw error
  }
}
