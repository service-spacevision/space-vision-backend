import { db } from '../../../db/connection'
import { permissions } from '../../../models/Permission'
import { eq } from 'drizzle-orm'

// Import permissions from all route files
import { permission as authPermissions } from '../../../../routes/authRoute/authRoute'
import { permission as bluetideUsagePermissions } from '../../../../routes/bluetideUsageRoute/bluetideUsageRoute'
import { permission as groupAccessPermissions } from '../../../../routes/groupAccessRoute/groupAccessRoute'
import { permission as mikrotikUsagePermissions } from '../../../../routes/mikrotikUsageRoute/mikrotikUsageRoute'
import { permission as mikrotikVesselPermissions } from '../../../../routes/mikrotikVesselRoute/mikrotikVesselRoute'
import { permission as organizationPermissions } from '../../../../routes/organizationRoute/organizationRoute'
import { permission as permissionRoutePermissions } from '../../../../routes/permissionRoute/permissionRoute'
import { permission as pinManagementPermissions } from '../../../../routes/pinManagementRoute/pinManagementRoute'
import { permission as rolesPermissionPermissions } from '../../../../routes/rolesPermissionRoute/rolesPermissionRoute'
import { permission as starlinkUsagePermissions } from '../../../../routes/starlinkUsageRoute/starlinkUsageRoute'
import { permission as systemPermissions } from '../../../../routes/systemRoute/systemRoute'
import { permission as telephonyDidPermissions } from '../../../../routes/telephonyDidRoute/telephonyDidRoute'
import { permission as userRolePermissions } from '../../../../routes/userRoleRoute/userRoleRoute'
import { permission as userPermissions } from '../../../../routes/userRoute/userRoute'
import { permission as vesselGroupPermissions } from '../../../../routes/vesselGroupRoute/vesselGroupRoute'
import { permission as vesselPermissions } from '../../../../routes/vesselRoute/vesselRoute'

interface ExtractedPermission {
  method: string
  path: string
  code: string
  section: 'admin' | 'organization'
}

function gatherPermissionsFromExports(): ExtractedPermission[] {
  // Group route maps with their corresponding section
  const sources: Array<{ map: Record<string, string>; section: 'admin' | 'organization' }> = [
    // Admin routes -> section: admin (add admin routes here when available)
    
    // Organization routes -> section: organization
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

function extractResourceAndAction(permissionCode: string): { resource: string; action: string } {
  // Extract resource and action from permission codes like "read_user_roles", "create_telephony_did"
  const parts = permissionCode.split('_')
  if (parts.length < 2) {
    return { resource: 'unknown', action: permissionCode }
  }

  const action = parts[0]
  const resource = parts.slice(1).join('_')
  
  return { resource, action }
}

export async function syncApiPermissions(): Promise<void> {
  try {
    console.log('🔄 Starting API permissions sync...')
    
    const extractedPermissions = gatherPermissionsFromExports()
    
    // Remove duplicates based on permission code
    const uniquePermissions = extractedPermissions.reduce((acc, current) => {
      const existing = acc.find(item => item.code === current.code)
      if (!existing) {
        acc.push(current)
      }
      return acc
    }, [] as ExtractedPermission[])
    
    console.log(`📊 Found ${extractedPermissions.length} API permissions (${uniquePermissions.length} unique) to sync`)

    let syncedCount = 0
    let createdCount = 0
    let updatedCount = 0

    for (const { method, path, code, section } of uniquePermissions) {
      const { resource, action } = extractResourceAndAction(code)
      
      // Check if permission already exists
      const existingPermission = await db
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
        description: `API permission for ${method} ${path}`
      }

      if (existingPermission.length === 0) {
        // Create new permission
        await db.insert(permissions).values(permissionData)
        createdCount++
        console.log(`✅ Created permission: ${code}`)
      } else {
        // Check if update is needed by comparing values
        const existing = existingPermission[0]
        const needsUpdate = 
          existing.resource !== permissionData.resource ||
          existing.action !== permissionData.action ||
          existing.category !== permissionData.category ||
          existing.section !== permissionData.section ||
          existing.scope !== permissionData.scope ||
          existing.description !== permissionData.description

        if (needsUpdate) {
          // Update existing permission
          await db
            .update(permissions)
            .set({
              resource: permissionData.resource,
              action: permissionData.action,
              category: permissionData.category,
              section: permissionData.section,
              scope: permissionData.scope,
              description: permissionData.description,
              updatedAt: new Date()
            })
            .where(eq(permissions.name, code))
          updatedCount++
          console.log(`🔄 Updated permission: ${code}`)
        }
        // If no update needed, we don't log anything (silent)
      }
      
      syncedCount++
    }

    const skippedCount = syncedCount - createdCount - updatedCount

    if (createdCount > 0 || updatedCount > 0) {
      console.log(`✅ API permissions sync completed:`)
      console.log(`   📈 Total processed: ${syncedCount}`)
      console.log(`   🆕 Created: ${createdCount}`)
      console.log(`   🔄 Updated: ${updatedCount}`)
      console.log(`   ⏭️  Skipped (no changes): ${skippedCount}`)
    } else {
      console.log(`✅ API permissions sync completed: ${syncedCount} permissions checked, no changes needed`)
    }

  } catch (error) {
    console.error('❌ Failed to sync API permissions:', error)
    throw error
  }
}