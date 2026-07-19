import { http, HttpResponse } from 'msw'
import { mockEvents } from '../fixtures/events'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let events: any[] = [...mockEvents]

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

export const timelineHandlers = [
  // 事件列表（支持排序）
  http.get('/api/v0/worlds/:worldId/events', ({ params, request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const page_size = Number(url.searchParams.get('page_size')) || 20
    const scope = url.searchParams.get('scope')
    const sortOrder = url.searchParams.get('sort') || 'asc'

    let filtered = events.filter(e => e.world_id === params.worldId)
    if (scope) {
      filtered = filtered.filter(e => e.affected_scope === scope)
    }

    filtered.sort((a, b) => {
      return sortOrder === 'desc' ? b.sort_key - a.sort_key : a.sort_key - b.sort_key
    })

    return paginatedResponse(filtered, page, page_size)
  }),

  // 创建事件
  http.post('/api/v0/worlds/:worldId/events', async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>
    const newEvent = {
      event_id: `ev-${String(events.length + 1).padStart(3, '0')}`,
      world_id: params.worldId as string,
      title: body.title as string ?? '',
      description: body.description as string ?? '',
      story_time: body.story_time ?? null,
      sort_key: (body.sort_key as number) ?? 0,
      affected_scope: body.affected_scope as string ?? 'personal',
      participants: (body.participants as string[]) ?? [],
      impacts: body.impacts as string ?? '',
      is_retroactively_added: (body.is_retroactively_added as boolean) ?? false,
      created_at: new Date().toISOString(),
      ...body
    }
    events.push(newEvent)
    return apiResponse(newEvent)
  }),

  // 事件详情
  http.get('/api/v0/worlds/:worldId/events/:id', ({ params }) => {
    const event = events.find(e => e.event_id === params.id && e.world_id === params.worldId)
    if (!event) {
      return HttpResponse.json(
        { code: 404, message: "Event not found", data: null, timestamp: new Date().toISOString(), request_id: crypto.randomUUID() },
        { status: 404 }
      )
    }
    return apiResponse(event)
  }),

  // 因果链查询
  http.get('/api/v0/worlds/:worldId/events/causality/:id', ({ params }) => {
    const event = events.find(e => e.event_id === params.id && e.world_id === params.worldId)
    if (!event) {
      return HttpResponse.json(
        { code: 404, message: "Event not found", data: null, timestamp: new Date().toISOString(), request_id: crypto.randomUUID() },
        { status: 404 }
      )
    }

    // 模拟因果链：找到在此事件前后的关联事件
    const worldEvents = events
      .filter(e => e.world_id === params.worldId)
      .sort((a, b) => a.sort_key - b.sort_key)

    const currentIndex = worldEvents.findIndex(e => e.event_id === params.id)
    const causes = worldEvents.slice(Math.max(0, currentIndex - 2), currentIndex)
    const effects = worldEvents.slice(currentIndex + 1, currentIndex + 3)

    return apiResponse({
      event,
      causes: causes.map(e => ({ event_id: e.event_id, title: e.title, sort_key: e.sort_key })),
      effects: effects.map(e => ({ event_id: e.event_id, title: e.title, sort_key: e.sort_key }))
    })
  }),

  // 删除事件
  http.delete('/api/v0/worlds/:worldId/events/:id', ({ params }) => {
    const index = events.findIndex(e => e.event_id === params.id && e.world_id === params.worldId)
    if (index === -1) {
      return HttpResponse.json(
        { code: 404, message: "Event not found", data: null, timestamp: new Date().toISOString(), request_id: crypto.randomUUID() },
        { status: 404 }
      )
    }
    events.splice(index, 1)
    return apiResponse(null)
  }),
]
