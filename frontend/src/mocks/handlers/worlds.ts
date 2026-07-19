import { http, HttpResponse } from 'msw'
import { mockWorlds } from '../fixtures/worlds'

// 内存数据副本（使用 any[] 以支持动态 CRUD）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let worlds: any[] = [...mockWorlds]

function apiResponse<T>(data: T) {
  return HttpResponse.json({
    code: 0,
    message: "success",
    data,
    timestamp: new Date().toISOString(),
    request_id: crypto.randomUUID()
  })
}

function paginatedResponse<T>(items: T[], page = 1, page_size = 20) {
  const start = (page - 1) * page_size
  const paginatedItems = items.slice(start, start + page_size)
  return apiResponse({
    items: paginatedItems,
    pagination: {
      page,
      page_size,
      total: items.length,
      total_pages: Math.ceil(items.length / page_size)
    }
  })
}

export const worldHandlers = [
  // 列表
  http.get('/api/v0/worlds', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const page_size = Number(url.searchParams.get('page_size')) || 20
    const status = url.searchParams.get('status')

    let filtered = worlds
    if (status) {
      filtered = worlds.filter(w => w.status === status)
    }
    return paginatedResponse(filtered, page, page_size)
  }),

  // 创建
  http.post('/api/v0/worlds', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    const newWorld = {
      world_id: `w-${String(worlds.length + 1).padStart(3, '0')}`,
      name: body.name as string ?? '',
      description: body.description as string ?? '',
      status: 'active',
      time_system: body.time_system ?? { hierarchy: [] as string[], era_name: '' },
      entity_count: 0,
      event_count: 0,
      relation_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...body
    }
    worlds.push(newWorld)
    return apiResponse(newWorld)
  }),

  // 详情
  http.get('/api/v0/worlds/:id', ({ params }) => {
    const world = worlds.find(w => w.world_id === params.id)
    if (!world) {
      return HttpResponse.json(
        { code: 404, message: "World not found", data: null, timestamp: new Date().toISOString(), request_id: crypto.randomUUID() },
        { status: 404 }
      )
    }
    return apiResponse(world)
  }),

  // 更新
  http.patch('/api/v0/worlds/:id', async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>
    const index = worlds.findIndex(w => w.world_id === params.id)
    if (index === -1) {
      return HttpResponse.json(
        { code: 404, message: "World not found", data: null, timestamp: new Date().toISOString(), request_id: crypto.randomUUID() },
        { status: 404 }
      )
    }
    worlds[index] = { ...worlds[index], ...body, updated_at: new Date().toISOString() }
    return apiResponse(worlds[index])
  }),

  // 删除
  http.delete('/api/v0/worlds/:id', ({ params }) => {
    const index = worlds.findIndex(w => w.world_id === params.id)
    if (index === -1) {
      return HttpResponse.json(
        { code: 404, message: "World not found", data: null, timestamp: new Date().toISOString(), request_id: crypto.randomUUID() },
        { status: 404 }
      )
    }
    worlds.splice(index, 1)
    return apiResponse(null)
  }),
]
