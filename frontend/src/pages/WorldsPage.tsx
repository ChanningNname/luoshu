import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorlds, useCreateWorld, useDeleteWorld } from '../api/hooks'
import { useWorldStore } from '../stores/worldStore'
import Modal from '../components/shared/Modal'
import ConfirmDialog from '../components/shared/ConfirmDialog'
import FormField from '../components/shared/FormField'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import EmptyState from '../components/shared/EmptyState'

export default function WorldsPage() {
  const navigate = useNavigate()
  const { setCurrentWorld } = useWorldStore()
  const { data: worldsRes, isLoading } = useWorlds()
  const createWorld = useCreateWorld()
  const deleteWorld = useDeleteWorld()

  const [showCreate, setShowCreate] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', description: '', era_name: '', hierarchy: '' })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const worlds = (worldsRes as any)?.data?.items ?? []

  const handleCreate = () => {
    if (!form.name.trim()) return
    createWorld.mutate({
      name: form.name,
      description: form.description,
      time_system: {
        hierarchy: form.hierarchy.split(/[,，]/).map((s: string) => s.trim()).filter(Boolean),
        era_name: form.era_name
      }
    }, {
      onSuccess: () => {
        setShowCreate(false)
        setForm({ name: '', description: '', era_name: '', hierarchy: '' })
      }
    })
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteWorld.mutate(deleteTarget, {
      onSuccess: () => setDeleteTarget(null)
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelectWorld = (world: any) => {
    setCurrentWorld(world.world_id)
    navigate('/entities')
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">世界工坊</h1>
          <p className="text-sm text-gray-500 mt-1">管理你的叙事世界</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + 创建世界
        </button>
      </div>

      {worlds.length === 0 ? (
        <EmptyState
          icon="🌍"
          title="还没有世界"
          description="创建你的第一个叙事世界，开始构建故事吧"
          action={{ label: '创建世界', onClick: () => setShowCreate(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {worlds.map((world: any) => (
            <div
              key={world.world_id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => handleSelectWorld(world)}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                  {world.name}
                </h3>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteTarget(world.world_id) }}
                  className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  title="删除"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{world.description}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>实体 {world.entity_count}</span>
                <span>事件 {world.event_count}</span>
                <span>关系 {world.relation_count}</span>
              </div>
              <div className="mt-3 text-xs text-gray-400">
                创建于 {new Date(world.created_at).toLocaleDateString('zh-CN')}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="创建新世界">
        <FormField label="世界名称" required>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="输入世界名称"
          />
        </FormField>
        <FormField label="世界描述">
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={3}
            placeholder="描述这个世界的背景设定"
          />
        </FormField>
        <FormField label="纪元名称">
          <input
            type="text"
            value={form.era_name}
            onChange={(e) => setForm({ ...form, era_name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="例如：太初历"
          />
        </FormField>
        <FormField label="时间层级（逗号分隔）">
          <input
            type="text"
            value={form.hierarchy}
            onChange={(e) => setForm({ ...form, hierarchy: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="例如：纪元,年,月,日"
          />
        </FormField>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setShowCreate(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            取消
          </button>
          <button
            onClick={handleCreate}
            disabled={!form.name.trim() || createWorld.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {createWorld.isPending ? '创建中...' : '创建'}
          </button>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="删除世界"
        message="确定要删除这个世界吗？此操作不可撤销，世界中的所有数据将被永久删除。"
        confirmLabel="删除"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
    </div>
  )
}
