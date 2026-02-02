import { db } from './connection'
import { userRoles } from '../models/UserRole'
import { rolesPermission } from '../models/RolePermission'
import { eq } from 'drizzle-orm'

export async function seedUserRoles() {
  try {
    console.log('Seeding user roles...')

    const defaultRoles = [
      {
        name: 'admin',
        displayName: 'Administrator',
        description: 'Full system access with all permissions',
        isSystem: true,
        created_by: 'system'
      },
      {
        name: 'user',
        displayName: 'User',
        description: 'Standard user with basic permissions',
        isSystem: true,
        created_by: 'system'
      },
      {
        name: 'moderator',
        displayName: 'Moderator',
        description: 'Moderator with limited administrative permissions',
        isSystem: false,
        created_by: 'system'
      }
    ]

    for (const role of defaultRoles) {
      try {
        await db.insert(userRoles).values(role as any).onConflictDoNothing()
        console.log(`✓ Created role: ${role.name}`)
      } catch (error) {
        console.log(`- Role ${role.name} already exists`)
      }
      // Ensure roles_permission row exists
      const [roleRow] = await db.select({ id: userRoles.id }).from(userRoles).where(eq(userRoles.name, role.name)).limit(1)
      if (roleRow?.id) {
        try {
          await db.insert(rolesPermission).values({
            roleId: roleRow.id,
            api_permissions: JSON.stringify([]),
            component_permissions: JSON.stringify([]),
            navigation_permissions: JSON.stringify([])
          }).onConflictDoNothing()
        } catch (e) {
          // ignore if exists
        }
      }
    }

    console.log('User roles seeding completed!')
  } catch (error) {
    console.error('Error seeding user roles:', error)
    throw error
  }
}

// Run if called directly
if (require.main === module) {
  seedUserRoles()
    .then(() => {
      console.log('Seeding completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Seeding failed:', error)
      process.exit(1)
    })
}
