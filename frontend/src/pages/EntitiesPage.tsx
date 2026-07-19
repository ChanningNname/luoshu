import { useState } from 'react'
import { useEntities, useCreateEntity, useDeleteEntity } from '../api/hooks'
import { useWorldStore } from '../stores/worldStore'
import Modal from '../components/shared/Modal'
import ConfirmDialog from '../components/shared/ConfirmDialog'
import FormField from '../components/shared/FormField'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import EmptyState from '../components/shared/EmptyState'
import Badge from '../components/shared/Badge'

const typeColors: Record<string, 'blue' | 'green' | 'purple'> = {
  character: 'blue',
  item: 'green',
  faction: 'purple',
}
const typeLabels: Record<string, string> = {
  character: '人物',
  item: '物品',
  faction: '势力',
}

export default function EntitiesPage() {
  const { currentWorldId } = useWorldStore()
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selected, setSelected] = useState<any>(null)
  const [form, setForm] = useState({ name: '', type: 'character', description: '', born_story_time: '' })

  const { data: entitiesRes, isLoading } = useEntities(currentWorldId ?? '', {
    type: typeFilter || undefined,
    status: statusFilter || undefined,
  })
  const createEntity = useCreateEntity(currentWorldId ?? '')
  const deleteEntity = useDeleteEntity(currentWorldId ?? '')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const entities: any[] = (entitiesRes as any)?.data?.items ?? []
  const filtered = entities.filter((e) =>
    !search || e.name.includes(search) || e.description?.includes(search)
  )

  if (!currentWorldId) {
    return (
      <EmptyState
        icon="🌍"
        title="请先选择一个世界"
        description="在顶部导航栏选择世界，或前往世界工坊创建一个新世界"
      />
    )
  }

  const handleCreate = () => {
    if (!form.name.trim()) return
    createEntity.mutate({
      name: form.name,
      type: form.type,
      description: form.description,
      born_story_time: form.born_story_time || null,
      custom_attributes: {}
    }, {
      onSuccess: () => {
        setShowCreate(false)
        setForm({ name: '', type: 'character', description: '', born_story_time: '' })
      }
    })
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteEntity.mutate(deleteTarget, {
      onSuccess: () => { setDeleteTarget(null); setSelected(null) }
    })
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">实体画廊</h1>
          <p className="text-sm text-gray-500 mt-1">管理世界中的人物、物品和势力</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + 创建实体
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">全部类型</option>
          <option value="character">人物</option>
          <option value="item">物品</option>
          <option value="faction">势力</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">全部状态</option>
          <option value="active">活跃</option>
          <option value="inactive">停用</option>
        </select>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索实体..."
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 flex-1 max-w-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="👤"
          title="暂无实体"
          description="创建你的第一个角色、物品或势力"
          action={{ label: '创建实体', onClick: () => setShowCreate(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {filtered.map((entity: any) => (
            <div
              key={entity.entity_id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelected(entity)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-gray-900">{entity.name}</h3>
                <Badge label={typeLabels[entity.type] ?? entity.type} color={typeColors[entity.type] ?? 'gray'} />
              </div>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{entity.description}</p>
              <div className="flex items-center gap-2 flex-wrap">
                {entity.custom_attributes?.character_state && (
                  <Badge label={entity.custom_attributes.character_state} color={entity.custom_attributes.character_state === 'active' ? 'green' : entity.custom_attributes.character_state === 'dead' ? 'red' : 'yellow'} />
                )}
                {entity.custom_attributes?.faction_state && (
                  <Badge label={entity.custom_attributes.faction_state} color={entity.custom_attributes.faction_state === 'active' ? 'green' : 'red'} />
                )}
                {entity.custom_attributes?.item_state && (
                  <Badge label={entity.custom_attributes.item_state} color={entity.custom_attributes.item_state === 'active' ? 'green' : 'yellow'} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Panel */}
      {selected && (
        <div className="fixed inset-0 z-40 flex">
          <div className="flex-1" onClick={() => setSelected(null)} />
          <div className="w-96 bg-white shadow-2xl border-l border-gray-200 overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{selected.name}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <Badge label={typeLabels[selected.type] ?? selected.type} color={typeColors[selected.type] ?? 'gray'} size="md" />
            <p className="text-sm text-gray-600 mt-4">{selected.description}</p>

            <div className="mt-6 space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">生命周期</h3>
              <div className="text-sm text-gray-600">
                <p>诞生：{selected.born_story_time ?? '未设定'}</p>
                <p>消亡：{selected.died_story_time ?? '未设定'}</p>
              </div>
            </div>

            {selected.custom_attributes && Object.keys(selected.custom_attributes).length > 0 && (
              <div className="mt-6 space-y-2">
                <h3 className="text-sm font-semibold text-gray-700">属性</h3>
                <div className="bg-gray-50 rounded-lg p-3">
                  {Object.entries(selected.custom_attributes).map(([key, val]) => (
                    <div key={key} className="flex justify-between text-sm py-1 border-b border-gray-100 last:border-0">
                      <span className="text-gray-500">{key}</span>
                      <span className="text-gray-900 font-medium">{Array.isArray(val) ? (val as string[]).join(', ') : String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t">
              <button
                onClick={() => { setDeleteTarget(selected.entity_id); setSelected(null) }}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                删除此实体
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="创建实体">
        <FormField label="名称" required>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="实体名称"
          />
        </FormField>
        <FormField label="类型" required>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="character">人物</option>
            <option value="item">物品</option>
            <option value="faction">势力</option>
          </select>
        </FormField>
        <FormField label="描述">
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={3}
            placeholder="实体描述"
          />
        </FormField>
        <FormField label="诞生故事时间">
          <input
            type="text"
            value={form.born_story_time}
            onChange={(e) => setForm({ ...form, born_story_time: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="例如：太初历三百年春"
          />
        </FormField>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">取消</button>
          <button
            onClick={handleCreate}
            disabled={!form.name.trim() || createEntity.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {createEntity.isPending ? '创建中...' : '创建'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="删除实体"
        message="确定要删除这个实体吗？与之相关的关系和记忆也将受到影响。"
        confirmLabel="删除"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
    </div>
  )
}
