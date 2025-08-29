// import { Elysia } from 'elysia'

// export const logger = {
//   info: (message: string, meta?: any) => {
//     console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta || '')
//   },
//   error: (message: string, error?: any) => {
//     console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error || '')
//   },
//   warn: (message: string, meta?: any) => {
//     console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, meta || '')
//   },
//   debug: (message: string, meta?: any) => {
//     if (process.env.NODE_ENV === 'development') {
//       console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, meta || '')
//     }
//   }
// }

// export const loggingMiddleware = new Elysia()
//   .onRequest(({ request, set }) => {
//     const start = Date.now()
//     logger.info(`${request.method} ${request.url}`)
    
//     // Store start time for response logging
//     set.headers['x-request-start'] = start.toString()
//   })
//   .onResponse(({ request, set }) => {
//     const start = parseInt(set.headers['x-request-start'] as string || '0')
//     const duration = Date.now() - start
    
//     logger.info(`${request.method} ${request.url} - ${set.status} - ${duration}ms`)
//   })
//   .onError(({ error, request, set }) => {
//     logger.error(`${request.method} ${request.url} - Error:`, error.message)
    
//     if (set.status === 500) {
//       logger.error('Stack trace:', error.stack)
//     }
//   })