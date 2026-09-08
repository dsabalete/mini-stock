import { requireAccess } from '../utils/access'

export default defineEventHandler(async (event) => {
  if (event.path === '/api/movements' && event.method === 'POST') await requireAccess(event)
  if (event.path === '/api/requests' && event.method === 'POST') await requireAccess(event)
  if (/^\/api\/requests\/\d+$/.test(event.path) && event.method === 'PATCH') await requireAccess(event)
})
