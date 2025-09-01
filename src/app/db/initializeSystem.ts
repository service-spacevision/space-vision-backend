import { seedUserRoles } from './seedUserRoles'
import { seedSystemAdmin } from './seedSystemAdmin'

export async function initializeSystem() {
  try {
    console.log('🚀 Initializing system...')
    
    // First seed user roles
    await seedUserRoles()
    
    // Then create system admin
    await seedSystemAdmin()
    
    console.log('✅ System initialization completed!')
  } catch (error) {
    console.error('❌ System initialization failed:', error)
    throw error
  }
}

// Run if called directly
if (require.main === module) {
  initializeSystem()
    .then(() => {
      console.log('System initialization completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('System initialization failed:', error)
      process.exit(1)
    })
}