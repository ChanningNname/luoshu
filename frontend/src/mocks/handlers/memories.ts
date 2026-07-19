import { http, HttpResponse } from 'msw'
import { mockMemories } from '../fixtures/memories'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let memories: any[] = [...mockMemories]

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

export const memoryHandlers = [
  // 列表
  http.get('/api/v0/worlds/:worldId/entities/:entityId/memories', ({ params, request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const page_size = Number(url.searchParams.get('page_size')) || 20
    const type = url.searchParams.get('type')

    let filtered = memories.filter(
      m => m.world_id === params.worldId && m.entity_id === params.entityId
    )
    if (type) {
      filtered = filtered.filter(m => m.type === type)
    }
    return paginatedResponse(filtered, page, page_size)
  }),

  // 创建
  http.post('/api/v0/worlds/:worldId/entities/:entityId/memories', async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>
    const newMemory = {
      memory_id: `m-${String(memories.length + 1).padStart(3, '0')}`,
      world_id: params.worldId as string,
      entity_id: params.entityId as string,
      type: body.type as string ?? 'short_term',
      title: body.title as string ?? '',
      content: body.content as string ?? '',
      importance: (body.importance as number) ?? 5,
      associated_event_id: body.associated_event_id ?? null,
      story_time: body.story_time ?? null,
      sort_key: body.sort_key ?? null,
      tags: (body.tags as string[]) ?? [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...body
    }
    memories.push(newMemory)
    return apiResponse(newMemory)
  }),

  // 更新（升降级）
  http.patch('/api/v0/worlds/:worldId/entities/:entityId/memories/:id', async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>
    const index = memories.findIndex(
      m => m.memory_id === params.id && m.world_id === params.worldId && m.entity_id === params.entityId
    )
    if (index === -1) {
      return HttpResponse.json(
        { code: 404, message: "Memory not found", data: null, timestamp: new Date().toISOString(), request_id: crypto.randomUUID() },
        { status: 404 }
      )
    }
    memories[index] = { ...memories[index], ...body, updated_at: new Date().toISOString() }
    return apiResponse(memories[index])
  }),

  // 删除
  http.delete('/api/v0/worlds/:worldId/entities/:entityId/memories/:id', ({ params }) => {
    const index = memories.findIndex(
      m => m.memory_id === params.id && m.world_id === params.worldId && m.entity_id === params.entityId
    )
    if (index === -1) {
      return HttpResponse.json(
        { code: 404, message: "Memory not found", data: null, timestamp: new Date().toISOString(), request_id: crypto.randomUUID() },
        { status: 404 }
      )
    }
    memories.splice(index, 1)
    return apiResponse(null)
  }),
]
