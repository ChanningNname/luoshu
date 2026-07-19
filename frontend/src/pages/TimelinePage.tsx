import { useState } from 'react'
import { useTimeline, useCreateEvent, useDeleteEvent, useEntities } from '../api/hooks'
import { useWorldStore } from '../stores/worldStore'
import Modal from '../components/shared/Modal'
import ConfirmDialog from '../components/shared/ConfirmDialog'
import FormField from '../components/shared/FormField'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import EmptyState from '../components/shared/EmptyState'
import Badge from '../components/shared/Badge'

const scopeColors: Record<string, 'blue' | 'yellow' | 'red'> = {
  personal: 'blue',
  local: 'yellow',
  global: 'red',
}
const scopeLabels: Record<string, string> = {
  personal: '个人',
  local: '局部',
  global: '全局',
}

export default function TimelinePage() {
  const { currentWorldId } = useWorldStore()
  const [scopeFilter, setScopeFilter] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', description: '', story_time: '', sort_key: 0, affected_scope: 'personal', impacts: '' })

  const { data: eventsRes, isLoading } = useTimeline(currentWorldId ?? '', {
    scope: scopeFilter || undefined,
    sort: 'sort_key',
  })
  const { data: entitiesRes } = useEntities(currentWorldId ?? '', { page_size: 100 })
  const createEvent = useCreateEvent(currentWorldId ?? '')
  const deleteEvent = useDeleteEvent(currentWorldId ?? '')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const events: any[] = (eventsRes as any)?.data?.items ?? []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const entities: any[] = (entitiesRes as any)?.data?.items ?? []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const entityMap = new Map(entities.map((e: any) => [e.entity_id, e]))

  const sortedEvents = [...events].sort((a, b) => a.sort_key - b.sort_key)

  if (!currentWorldId) {
    return <EmptyState icon="🌍" title="请先选择一个世界" description="在顶部导航栏选择世界" />
  }

  const handleCreate = () => {
    if (!form.title.trim()) return
    createEvent.mutate({
      title: form.title,
      description: form.description,
      story_time: form.story_time,
      sort_key: form.sort_key,
      affected_scope: form.affected_scope,
      impacts: form.impacts,
      participants: [],
    }, {
      onSuccess: () => {
        setShowCreate(false)
        setForm({ title: '', description: '', story_time: '', sort_key: 0, affected_scope: 'personal', impacts: '' })
      }
    })
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteEvent.mutate(deleteTarget, {
      onSuccess: () => setDeleteTarget(null)
    })
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">时间轴</h1>
          <p className="text-sm text-gray-500 mt-1">按故事时间排列的世界事件</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={scopeFilter}
            onChange={(e) => setScopeFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">全部范围</option>
            <option value="personal">个人</option>
            <option value="local">局部</option>
            <option value="global">全局</option>
          </select>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            + 添加事件
          </button>
        </div>
      </div>

      {sortedEvents.length === 0 ? (
        <EmptyState
          icon="⏳"
          title="暂无事件"
          description="创建世界中的第一个事件"
          action={{ label: '添加事件', onClick: () => setShowCreate(true) }}
        />
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

          <div className="space-y-6">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {sortedEvents.map((event: any) => (
              <div key={event.event_id} className="relative pl-14">
                {/* Dot */}
                <div className={`absolute left-4 top-3 w-4 h-4 rounded-full border-2 border-white shadow ${
                  event.affected_scope === 'global' ? 'bg-red-500' :
                  event.affected_scope === 'local' ? 'bg-yellow-500' : 'bg-blue-500'
                }`} />

                <div
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setExpanded(expanded === event.event_id ? null : event.event_id)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-900">{event.title}</h3>
                    <div className="flex items-center gap-2">
                      <Badge label={scopeLabels[event.affected_scope] ?? event.affected_scope} color={scopeColors[event.affected_scope] ?? 'gray'} />
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(event.event_id) }}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span>{event.story_time}</span>
                    <span>·</span>
                    <span>参与者 {event.participants?.length ?? 0}</span>
                  </div>

                  {expanded === event.event_id && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                      {event.impacts && (
                        <div className="mb-3">
                          <span className="text-xs font-medium text-gray-700">影响：</span>
                          <p className="text-xs text-gray-600 mt-1">{event.impacts}</p>
                        </div>
                      )}
                      {event.participants?.length > 0 && (
                        <div>
                          <span className="text-xs font-medium text-gray-700">参与者：</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {event.participants.map((pid: string) => (
                              <Badge key={pid} label={entityMap.get(pid)?.name ?? pid} color="indigo" />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="添加事件">
        <FormField label="事件标题" required>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="事件标题"
          />
        </FormField>
        <FormField label="描述">
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={3}
            placeholder="事件描述"
          />
        </FormField>
        <FormField label="故事时间">
          <input
            type="text"
            value={form.story_time}
            onChange={(e) => setForm({ ...form, story_time: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="例如：太初历三百五十年春"
          />
        </FormField>
        <FormField label="排序键">
          <input
            type="number"
            value={form.sort_key}
            onChange={(e) => setForm({ ...form, sort_key: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </FormField>
        <FormField label="影响范围">
          <select
            value={form.affected_scope}
            onChange={(e) => setForm({ ...form, affected_scope: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="personal">个人</option>
            <option value="local">局部</option>
            <option value="global">全局</option>
          </select>
        </FormField>
        <FormField label="影响描述">
          <textarea
            value={form.impacts}
            onChange={(e) => setForm({ ...form, impacts: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={2}
            placeholder="事件产生了什么影响"
          />
        </FormField>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">取消</button>
          <button
            onClick={handleCreate}
            disabled={!form.title.trim() || createEvent.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {createEvent.isPending ? '创建中...' : '创建'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="删除事件"
        message="确定要删除这个事件吗？"
        confirmLabel="删除"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
    </div>
  )
}
