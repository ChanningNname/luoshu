import { http, HttpResponse } from 'msw'
import { mockEntities } from '../fixtures/entities'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let entities: any[] = [...mockEntities]

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

export const entityHandlers = [
  // 列表（支持 type/status 筛选）
  http.get('/api/v0/worlds/:worldId/entities', ({ params, request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const page_size = Number(url.searchParams.get('page_size')) || 20
    const type = url.searchParams.get('type')
    const status = url.searchParams.get('status')

    let filtered = entities.filter(e => e.world_id === params.worldId)
    if (type) {
      filtered = filtered.filter(e => e.type === type)
    }
    if (status) {
      filtered = filtered.filter(e => e.status === status)
    }
    return paginatedResponse(filtered, page, page_size)
  }),

  // 创建
  http.post('/api/v0/worlds/:worldId/entities', async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>
    const newEntity = {
      entity_id: `e-${String(entities.length + 1).padStart(3, '0')}`,
      world_id: params.worldId as string,
      type: body.type as string ?? 'character',
      name: body.name as string ?? '',
      description: body.description as string ?? '',
      status: 'active',
      born_story_time: body.born_story_time ?? null,
      born_sort_key: body.born_sort_key ?? null,
      died_story_time: null,
      died_sort_key: null,
      custom_attributes: body.custom_attributes ?? {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...body
    }
    entities.push(newEntity)
    return apiResponse(newEntity)
  }),

  // 详情
  http.get('/api/v0/worlds/:worldId/entities/:id', ({ params }) => {
    const entity = entities.find(e => e.entity_id === params.id && e.world_id === params.worldId)
    if (!entity) {
      return HttpResponse.json(
        { code: 404, message: "Entity not found", data: null, timestamp: new Date().toISOString(), request_id: crypto.randomUUID() },
        { status: 404 }
      )
    }
    return apiResponse(entity)
  }),

  // 更新
  http.patch('/api/v0/worlds/:worldId/entities/:id', async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>
    const index = entities.findIndex(e => e.entity_id === params.id && e.world_id === params.worldId)
    if (index === -1) {
      return HttpResponse.json(
        { code: 404, message: "Entity not found", data: null, timestamp: new Date().toISOString(), request_id: crypto.randomUUID() },
        { status: 404 }
      )
    }
    entities[index] = { ...entities[index], ...body, updated_at: new Date().toISOString() }
    return apiResponse(entities[index])
  }),

  // 删除
  http.delete('/api/v0/worlds/:worldId/entities/:id', ({ params }) => {
    const index = entities.findIndex(e => e.entity_id === params.id && e.world_id === params.worldId)
    if (index === -1) {
      return HttpResponse.json(
        { code: 404, message: "Entity not found", data: null, timestamp: new Date().toISOString(), request_id: crypto.randomUUID() },
        { status: 404 }
      )
    }
    entities.splice(index, 1)
    return apiResponse(null)
  }),
]
