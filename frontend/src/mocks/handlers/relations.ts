import { http, HttpResponse } from 'msw'
import { mockRelations } from '../fixtures/relations'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let relations: any[] = [...mockRelations]

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

export const relationHandlers = [
  // 列表
  http.get('/api/v0/worlds/:worldId/relations', ({ params, request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const page_size = Number(url.searchParams.get('page_size')) || 20
    const dimension = url.searchParams.get('dimension')
    const entityId = url.searchParams.get('entity_id')

    let filtered = relations.filter(r => r.world_id === params.worldId)
    if (dimension) {
      filtered = filtered.filter(r => r.dimension === dimension)
    }
    if (entityId) {
      filtered = filtered.filter(r => r.source_entity_id === entityId || r.target_entity_id === entityId)
    }
    return paginatedResponse(filtered, page, page_size)
  }),

  // 图谱查询
  http.get('/api/v0/worlds/:worldId/relations/graph', ({ params, request }) => {
    const url = new URL(request.url)
    const entityId = url.searchParams.get('entity_id')

    let filtered = relations.filter(r => r.world_id === params.worldId)
    if (entityId) {
      filtered = filtered.filter(r => r.source_entity_id === entityId || r.target_entity_id === entityId)
    }

    // 构建节点和边
    const nodeIds = new Set<string>()
    filtered.forEach(r => {
      nodeIds.add(r.source_entity_id)
      nodeIds.add(r.target_entity_id)
    })

    return apiResponse({
      nodes: Array.from(nodeIds).map(id => ({ entity_id: id })),
      edges: filtered.map(r => ({
        relation_id: r.relation_id,
        source: r.source_entity_id,
        target: r.target_entity_id,
        dimension: r.dimension,
        relation_type: r.relation_type,
        strength: r.strength,
        is_bidirectional: r.is_bidirectional,
        is_expired: r.is_expired
      }))
    })
  }),

  // 创建
  http.post('/api/v0/worlds/:worldId/relations', async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>
    const newRelation = {
      relation_id: `r-${String(relations.length + 1).padStart(3, '0')}`,
      world_id: params.worldId as string,
      source_entity_id: body.source_entity_id as string ?? '',
      target_entity_id: body.target_entity_id as string ?? '',
      dimension: body.dimension as string ?? '',
      relation_type: body.relation_type as string ?? '',
      strength: (body.strength as number) ?? 5,
      description: body.description as string ?? '',
      start_story_time: body.start_story_time ?? null,
      start_sort_key: body.start_sort_key ?? null,
      end_story_time: null,
      end_sort_key: null,
      is_bidirectional: (body.is_bidirectional as boolean) ?? false,
      is_expired: false,
      created_at: new Date().toISOString(),
      ...body
    }
    relations.push(newRelation)
    return apiResponse(newRelation)
  }),

  // 删除
  http.delete('/api/v0/worlds/:worldId/relations/:id', ({ params }) => {
    const index = relations.findIndex(r => r.relation_id === params.id && r.world_id === params.worldId)
    if (index === -1) {
      return HttpResponse.json(
        { code: 404, message: "Relation not found", data: null, timestamp: new Date().toISOString(), request_id: crypto.randomUUID() },
        { status: 404 }
      )
    }
    relations.splice(index, 1)
    return apiResponse(null)
  }),
]
