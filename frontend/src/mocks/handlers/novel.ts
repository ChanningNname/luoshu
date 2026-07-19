import { http, HttpResponse } from 'msw'
import { mockChapters } from '../fixtures/chapters'

let chapters = [...mockChapters]

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

export const novelHandlers = [
  // 章节列表
  http.get('/api/v0/worlds/:worldId/chapters', ({ params, request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const page_size = Number(url.searchParams.get('page_size')) || 20
    const status = url.searchParams.get('status')

    let filtered = chapters.filter(c => c.world_id === params.worldId)
    if (status) {
      filtered = filtered.filter(c => c.status === status)
    }
    filtered.sort((a, b) => a.sort_order - b.sort_order)
    return paginatedResponse(filtered, page, page_size)
  }),

  // 创建章节
  http.post('/api/v0/worlds/:worldId/chapters', async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>
    const newChapter = {
      chapter_id: `ch-${String(chapters.length + 1).padStart(3, '0')}`,
      world_id: params.worldId as string,
      title: body.title as string ?? '',
      description: body.description as string ?? '',
      sort_order: (body.sort_order as number) ?? chapters.length + 1,
      status: 'draft',
      word_count: 0,
      event_ids: (body.event_ids as string[]) ?? [],
      entity_ids: (body.entity_ids as string[]) ?? [],
      variants: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...body
    }
    chapters.push(newChapter)
    return apiResponse(newChapter)
  }),

  // 章节详情
  http.get('/api/v0/worlds/:worldId/chapters/:id', ({ params }) => {
    const chapter = chapters.find(c => c.chapter_id === params.id && c.world_id === params.worldId)
    if (!chapter) {
      return HttpResponse.json(
        { code: 404, message: "Chapter not found", data: null, timestamp: new Date().toISOString(), request_id: crypto.randomUUID() },
        { status: 404 }
      )
    }
    return apiResponse(chapter)
  }),

  // 章节上下文（返回 Markdown）
  http.get('/api/v0/worlds/:worldId/chapters/:id/context', ({ params }) => {
    const chapter = chapters.find(c => c.chapter_id === params.id && c.world_id === params.worldId)
    if (!chapter) {
      return HttpResponse.json(
        { code: 404, message: "Chapter not found", data: null, timestamp: new Date().toISOString(), request_id: crypto.randomUUID() },
        { status: 404 }
      )
    }

    const primaryVariant = chapter.variants.find(v => v.is_primary)
    const markdown = primaryVariant?.content_markdown ?? `# ${chapter.title}\n\n（暂无内容）`

    return apiResponse({
      chapter_id: chapter.chapter_id,
      title: chapter.title,
      content_markdown: markdown,
      related_entities: chapter.entity_ids,
      related_events: chapter.event_ids
    })
  }),

  // 更新章节
  http.patch('/api/v0/worlds/:worldId/chapters/:id', async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>
    const index = chapters.findIndex(c => c.chapter_id === params.id && c.world_id === params.worldId)
    if (index === -1) {
      return HttpResponse.json(
        { code: 404, message: "Chapter not found", data: null, timestamp: new Date().toISOString(), request_id: crypto.randomUUID() },
        { status: 404 }
      )
    }
    chapters[index] = { ...chapters[index], ...body, updated_at: new Date().toISOString() }
    return apiResponse(chapters[index])
  }),

  // 删除章节
  http.delete('/api/v0/worlds/:worldId/chapters/:id', ({ params }) => {
    const index = chapters.findIndex(c => c.chapter_id === params.id && c.world_id === params.worldId)
    if (index === -1) {
      return HttpResponse.json(
        { code: 404, message: "Chapter not found", data: null, timestamp: new Date().toISOString(), request_id: crypto.randomUUID() },
        { status: 404 }
      )
    }
    chapters.splice(index, 1)
    return apiResponse(null)
  }),
]
