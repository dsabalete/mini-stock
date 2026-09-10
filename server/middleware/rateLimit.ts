import {
  requestRateLimit,
  authRateLimit,
  adminRateLimit,
} from '../utils/rateLimit'

export default defineEventHandler(async (event) => {
  if (!event.path.startsWith('/api/')) return

  let result
  if (event.path === '/api/requests' && event.method === 'POST') {
    result = await authRateLimit(event)
  } else if (event.path === '/api/movements' && event.method === 'POST') {
    result = await adminRateLimit(event)
  } else if (
    /^\/api\/requests\/\d+$/.test(event.path) &&
    event.method === 'PATCH'
  ) {
    result = await adminRateLimit(event)
  } else {
    result = await requestRateLimit(event)
  }

  setHeader(event, 'X-RateLimit-Remaining', result.remaining.toString())
  setHeader(
    event,
    'X-RateLimit-Reset',
    Math.ceil(result.resetAt / 1000).toString()
  )

  if (!result.allowed) {
    setHeader(
      event,
      'Retry-After',
      Math.ceil((result.resetAt - Date.now()) / 1000).toString()
    )
    throw createError({
      statusCode: 429,
      statusMessage: 'Demasiadas peticiones. Intenta de nuevo más tarde.',
    })
  }
})
