import { http, HttpResponse } from 'msw'
import { mockRules } from '../fixtures/rules'

let rules = [...mockRules]

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

export const ruleHandlers = [
  // 列表
  http.get('/api/v0/worlds/:worldId/rules', ({ params, request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const page_size = Number(url.searchParams.get('page_size')) || 20
    const category = url.searchParams.get('category')

    let filtered = rules.filter(r => r.world_id === params.worldId)
    if (category) {
      filtered = filtered.filter(r => r.category === category)
    }
    return paginatedResponse(filtered, page, page_size)
  }),

  // 创建
  http.post('/api/v0/worlds/:worldId/rules', async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>
    const newRule = {
      rule_id: `rule-${String(rules.length + 1).padStart(3, '0')}`,
      world_id: params.worldId as string,
      title: body.title as string ?? '',
      category: body.category as string ?? 'general',
      content: body.content as string ?? '',
      priority: (body.priority as number) ?? 3,
      is_active: true,
      scope: body.scope as string ?? 'global',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...body
    }
    rules.push(newRule)
    return apiResponse(newRule)
  }),

  // 更新
  http.patch('/api/v0/worlds/:worldId/rules/:id', async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>
    const index = rules.findIndex(r => r.rule_id === params.id && r.world_id === params.worldId)
    if (index === -1) {
      return HttpResponse.json(
        { code: 404, message: "Rule not found", data: null, timestamp: new Date().toISOString(), request_id: crypto.randomUUID() },
        { status: 404 }
      )
    }
    rules[index] = { ...rules[index], ...body, updated_at: new Date().toISOString() }
    return apiResponse(rules[index])
  }),

  // 删除
  http.delete('/api/v0/worlds/:worldId/rules/:id', ({ params }) => {
    const index = rules.findIndex(r => r.rule_id === params.id && r.world_id === params.worldId)
    if (index === -1) {
      return HttpResponse.json(
        { code: 404, message: "Rule not found", data: null, timestamp: new Date().toISOString(), request_id: crypto.randomUUID() },
        { status: 404 }
      )
    }
    rules.splice(index, 1)
    return apiResponse(null)
  }),
]
