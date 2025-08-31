import { db } from './connection'
import { userRoles } from '../models/UserRole'

export async function seedUserRoles() {
  try {
    console.log('Seeding user roles...')

    const defaultRoles = [
      {
        name: 'admin',
        displayName: 'Administrator',
        description: 'Full system access with all permissions',
        permissions: [
          'create_user_role',
          'read_user_roles',
          'read_user_role',
          'update_user_role',
          'delete_user_role',
          'read_user_profile',
          'update_user_profile',
          'change_password',
          'delete_user_account'
        ],
        isSystem: true
      },
      {
        name: 'user',
        displayName: 'User',
        description: 'Standard user with basic permissions',
        permissions: [
          'read_user_profile',
          'update_user_profile',
          'change_password'
        ],
        isSystem: true
      },
      {
        name: 'moderator',
        displayName: 'Moderator',
        description: 'Moderator with limited administrative permissions',
        permissions: [
          'read_user_roles',
          'read_user_role',
          'read_user_profile',
          'update_user_profile',
          'change_password'
        ],
        isSystem: false
      }
    ]

    for (const role of defaultRoles) {
      try {
        await db.insert(userRoles).values(role).onConflictDoNothing()
        console.log(`✓ Created role: ${role.name}`)
      } catch (error) {
        console.log(`- Role ${role.name} already exists`)
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