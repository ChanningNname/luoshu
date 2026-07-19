import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { useChapters, useChapterContext, useCreateChapter, useDeleteChapter } from '../api/hooks'
import { useWorldStore } from '../stores/worldStore'
import Modal from '../components/shared/Modal'
import ConfirmDialog from '../components/shared/ConfirmDialog'
import FormField from '../components/shared/FormField'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import EmptyState from '../components/shared/EmptyState'
import Badge from '../components/shared/Badge'

export default function WritingPage() {
  const { currentWorldId } = useWorldStore()
  const [selectedChapterId, setSelectedChapterId] = useState('')
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0)
  const [showCreate, setShowCreate] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', description: '' })

  const { data: chaptersRes, isLoading } = useChapters(currentWorldId ?? '')
  const { data: contextRes } = useChapterContext(currentWorldId ?? '', selectedChapterId)
  const createChapter = useCreateChapter(currentWorldId ?? '')
  const deleteChapter = useDeleteChapter(currentWorldId ?? '')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chapters: any[] = (chaptersRes as any)?.data?.items ?? []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contextData = (contextRes as any)?.data ?? null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectedChapter = chapters.find((c: any) => c.chapter_id === selectedChapterId)
  const variants = selectedChapter?.variants ?? []
  const currentVariant = variants[selectedVariantIdx]

  if (!currentWorldId) {
    return <EmptyState icon="🌍" title="请先选择一个世界" description="在顶部导航栏选择世界" />
  }

  const handleCreate = () => {
    if (!form.title.trim()) return
    createChapter.mutate({
      title: form.title,
      description: form.description,
      sort_order: chapters.length + 1,
      status: 'draft',
    }, {
      onSuccess: () => {
        setShowCreate(false)
        setForm({ title: '', description: '' })
      }
    })
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteChapter.mutate(deleteTarget, {
      onSuccess: () => {
        setDeleteTarget(null)
        if (selectedChapterId === deleteTarget) {
          setSelectedChapterId('')
        }
      }
    })
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="flex h-full -m-6">
      {/* Left: Chapter list */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">章节列表</h2>
          <button
            onClick={() => setShowCreate(true)}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
          >
            + 新建
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {chapters.length === 0 ? (
            <p className="text-xs text-gray-400 p-2">暂无章节</p>
          ) : (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            chapters.map((chapter: any) => (
              <div
                key={chapter.chapter_id}
                className={`px-3 py-2.5 rounded-lg cursor-pointer mb-1 group transition-colors ${
                  selectedChapterId === chapter.chapter_id
                    ? 'bg-indigo-50 border border-indigo-200'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => { setSelectedChapterId(chapter.chapter_id); setSelectedVariantIdx(0) }}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${
                    selectedChapterId === chapter.chapter_id ? 'text-indigo-700' : 'text-gray-800'
                  }`}>
                    {chapter.title}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(chapter.chapter_id) }}
                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    label={chapter.status === 'published' ? '已发布' : '草稿'}
                    color={chapter.status === 'published' ? 'green' : 'yellow'}
                  />
                  <span className="text-xs text-gray-400">{chapter.word_count} 字</span>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Middle: Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {!selectedChapterId ? (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState icon="✍️" title="选择一个章节" description="在左侧选择章节查看内容" />
          </div>
        ) : (
          <>
            {/* Variant tabs */}
            {variants.length > 1 && (
              <div className="flex items-center gap-1 px-4 py-2 bg-white border-b border-gray-200">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {variants.map((v: any, idx: number) => (
                  <button
                    key={v.variant_id}
                    onClick={() => setSelectedVariantIdx(idx)}
                    className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                      selectedVariantIdx === idx
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {v.label}
                    {v.is_primary && ' ★'}
                  </button>
                ))}
              </div>
            )}

            {/* Markdown content */}
            <div className="flex-1 overflow-y-auto p-6 bg-white">
              {currentVariant ? (
                <article className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700">
                  <ReactMarkdown>{currentVariant.content_markdown}</ReactMarkdown>
                </article>
              ) : (
                <p className="text-sm text-gray-400">暂无内容</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Right: Context panel */}
      {selectedChapterId && (
        <aside className="w-72 bg-gray-50 border-l border-gray-200 overflow-y-auto p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">上下文包</h3>
          {contextData ? (
            <div className="space-y-3">
              {contextData.tiers ? (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                Object.entries(contextData.tiers).map(([tier, content]: [string, any]) => (
                  <div key={tier} className="bg-white rounded-lg p-3 border border-gray-200">
                    <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase">Tier {tier}</h4>
                    <div className="text-xs text-gray-600 prose prose-xs max-w-none">
                      <ReactMarkdown>{typeof content === 'string' ? content : JSON.stringify(content, null, 2)}</ReactMarkdown>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="text-xs text-gray-600 prose prose-xs max-w-none">
                    <ReactMarkdown>{typeof contextData === 'string' ? contextData : JSON.stringify(contextData, null, 2)}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-400">暂无上下文数据</p>
          )}

          {selectedChapter && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">章节信息</h3>
              <div className="space-y-1 text-xs text-gray-600">
                <p>关联事件：{selectedChapter.event_ids?.length ?? 0} 个</p>
                <p>关联实体：{selectedChapter.entity_ids?.length ?? 0} 个</p>
                <p>字数：{selectedChapter.word_count}</p>
                <p>变体数：{variants.length}</p>
              </div>
            </div>
          )}
        </aside>
      )}

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="新建章节">
        <FormField label="章节标题" required>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="第X章：标题"
          />
        </FormField>
        <FormField label="章节描述">
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={3}
            placeholder="章节内容概要"
          />
        </FormField>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">取消</button>
          <button
            onClick={handleCreate}
            disabled={!form.title.trim() || createChapter.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {createChapter.isPending ? '创建中...' : '创建'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="删除章节"
        message="确定要删除这个章节吗？章节的所有变体都将被删除。"
        confirmLabel="删除"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
    </div>
  )
}
