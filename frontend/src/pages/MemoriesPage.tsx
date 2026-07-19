import { useState } from 'react'
import { useMemories, useCreateMemory, useUpdateMemory, useDeleteMemory, useEntities } from '../api/hooks'
import { useWorldStore } from '../stores/worldStore'
import Modal from '../components/shared/Modal'
import ConfirmDialog from '../components/shared/ConfirmDialog'
import FormField from '../components/shared/FormField'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import EmptyState from '../components/shared/EmptyState'
import Badge from '../components/shared/Badge'

const typeColors: Record<string, 'blue' | 'green' | 'gray'> = {
  long_term: 'blue',
  short_term: 'green',
  misc: 'gray',
}
const typeLabels: Record<string, string> = {
  long_term: '长期记忆',
  short_term: '短期记忆',
  misc: '杂项',
}

export default function MemoriesPage() {
  const { currentWorldId } = useWorldStore()
  const [selectedEntityId, setSelectedEntityId] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', content: '', type: 'short_term', importance: 5 })

  const { data: entitiesRes, isLoading: entitiesLoading } = useEntities(currentWorldId ?? '', { page_size: 100 })
  const { data: memoriesRes, isLoading: memoriesLoading } = useMemories(currentWorldId ?? '', selectedEntityId)
  const createMemory = useCreateMemory(currentWorldId ?? '', selectedEntityId)
  const updateMemory = useUpdateMemory(currentWorldId ?? '', selectedEntityId)
  const deleteMemory = useDeleteMemory(currentWorldId ?? '', selectedEntityId)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const entities: any[] = (entitiesRes as any)?.data?.items ?? []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const memories: any[] = (memoriesRes as any)?.data?.items ?? []

  const characters = entities.filter(e => e.type === 'character')

  if (!currentWorldId) {
    return <EmptyState icon="🌍" title="请先选择一个世界" description="在顶部导航栏选择世界" />
  }

  const handleCreate = () => {
    if (!form.title.trim() || !form.content.trim()) return
    createMemory.mutate({
      title: form.title,
      content: form.content,
      type: form.type,
      importance: form.importance,
    }, {
      onSuccess: () => {
        setShowCreate(false)
        setForm({ title: '', content: '', type: 'short_term', importance: 5 })
      }
    })
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteMemory.mutate(deleteTarget, {
      onSuccess: () => setDeleteTarget(null)
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUpgrade = (memory: any) => {
    const newType = memory.type === 'misc' ? 'short_term' : 'long_term'
    updateMemory.mutate({ memoryId: memory.memory_id, data: { type: newType } })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDowngrade = (memory: any) => {
    const newType = memory.type === 'long_term' ? 'short_term' : 'misc'
    updateMemory.mutate({ memoryId: memory.memory_id, data: { type: newType } })
  }

  if (entitiesLoading) return <LoadingSpinner />

  return (
    <div className="flex h-full -m-6">
      {/* Left: Entity selection */}
      <aside className="w-60 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">选择角色</h2>
        </div>
        <div className="p-2">
          {characters.length === 0 ? (
            <p className="text-xs text-gray-400 p-2">暂无角色</p>
          ) : (
            characters.map((entity) => (
              <button
                key={entity.entity_id}
                onClick={() => setSelectedEntityId(entity.entity_id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedEntityId === entity.entity_id
                    ? 'bg-indigo-50 text-indigo-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {entity.name}
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Right: Memories list */}
      <div className="flex-1 overflow-y-auto p-6">
        {!selectedEntityId ? (
          <EmptyState icon="🧠" title="选择一个角色" description="在左侧选择角色以查看其记忆" />
        ) : memoriesLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">
                {entities.find(e => e.entity_id === selectedEntityId)?.name} 的记忆
              </h2>
              <button
                onClick={() => setShowCreate(true)}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                + 添加记忆
              </button>
            </div>

            {memories.length === 0 ? (
              <EmptyState
                icon="💭"
                title="暂无记忆"
                description="为这个角色添加第一条记忆"
                action={{ label: '添加记忆', onClick: () => setShowCreate(true) }}
              />
            ) : (
              <div className="space-y-3">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {memories.map((memory: any) => (
                  <div key={memory.memory_id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-gray-900">{memory.title}</h3>
                        <Badge label={typeLabels[memory.type] ?? memory.type} color={typeColors[memory.type] ?? 'gray'} />
                      </div>
                      <div className="flex items-center gap-1">
                        {memory.type !== 'long_term' && (
                          <button
                            onClick={() => handleUpgrade(memory)}
                            className="text-xs px-2 py-1 text-green-600 hover:bg-green-50 rounded"
                            title="升级"
                          >
                            升级
                          </button>
                        )}
                        {memory.type !== 'misc' && (
                          <button
                            onClick={() => handleDowngrade(memory)}
                            className="text-xs px-2 py-1 text-yellow-600 hover:bg-yellow-50 rounded"
                            title="降级"
                          >
                            降级
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteTarget(memory.memory_id)}
                          className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{memory.content}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>重要性：{memory.importance}/10</span>
                      {memory.story_time && <span>{memory.story_time}</span>}
                      {memory.tags?.length > 0 && (
                        <div className="flex gap-1">
                          {memory.tags.map((tag: string) => (
                            <span key={tag} className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="添加记忆">
        <FormField label="标题" required>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="记忆标题"
          />
        </FormField>
        <FormField label="内容" required>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={4}
            placeholder="记忆的详细内容"
          />
        </FormField>
        <FormField label="分类">
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="long_term">长期记忆</option>
            <option value="short_term">短期记忆</option>
            <option value="misc">杂项</option>
          </select>
        </FormField>
        <FormField label={`重要性 (${form.importance})`}>
          <input
            type="range"
            min={1} max={10}
            value={form.importance}
            onChange={(e) => setForm({ ...form, importance: Number(e.target.value) })}
            className="w-full"
          />
        </FormField>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">取消</button>
          <button
            onClick={handleCreate}
            disabled={!form.title.trim() || !form.content.trim() || createMemory.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {createMemory.isPending ? '创建中...' : '创建'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="删除记忆"
        message="确定要删除这条记忆吗？"
        confirmLabel="删除"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
    </div>
  )
}
