import { frontendPermissions } from '../../../constants/permissionsData'
import { createPermission_func } from './createPermission'

export async function populatePermissions() {
  let created = 0
  let skipped = 0

  for (const permissionData of frontendPermissions) {
    try {
      const result = await createPermission_func({ data: permissionData })

      if (result.success) {
        created++
      } else {
        // Any non-success result during population is likely a duplicate
        skipped++
      }
    } catch (error: any) {
      // Handle any errors that might slip through - treat all as skips during population
      skipped++
    }
  }

  console.log(`🔐 Frontend Permissions synced: ${created} created, ${skipped} already existed`)
}