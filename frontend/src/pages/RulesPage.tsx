import { useState } from 'react'
import { useRules, useCreateRule, useUpdateRule, useDeleteRule } from '../api/hooks'
import { useWorldStore } from '../stores/worldStore'
import Modal from '../components/shared/Modal'
import ConfirmDialog from '../components/shared/ConfirmDialog'
import FormField from '../components/shared/FormField'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import EmptyState from '../components/shared/EmptyState'
import Badge from '../components/shared/Badge'

const categoryColors: Record<string, 'blue' | 'green' | 'purple' | 'red' | 'yellow' | 'indigo'> = {
  cultivation: 'blue',
  social: 'green',
  restriction: 'red',
  world_building: 'purple',
  metaphysics: 'indigo',
  custom: 'yellow',
}
const categoryLabels: Record<string, string> = {
  cultivation: '修炼',
  social: '社会',
  restriction: '禁制',
  world_building: '世界构建',
  metaphysics: '玄学',
  custom: '自定义',
}

export default function RulesPage() {
  const { currentWorldId } = useWorldStore()
  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', content: '', category: 'custom', scope: 'global', priority: 3 })

  const { data: rulesRes, isLoading } = useRules(currentWorldId ?? '')
  const createRule = useCreateRule(currentWorldId ?? '')
  const updateRule = useUpdateRule(currentWorldId ?? '')
  const deleteRule = useDeleteRule(currentWorldId ?? '')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rules: any[] = (rulesRes as any)?.data?.items ?? []

  if (!currentWorldId) {
    return <EmptyState icon="🌍" title="请先选择一个世界" description="在顶部导航栏选择世界" />
  }

  const handleCreate = () => {
    if (!form.title.trim() || !form.content.trim()) return
    createRule.mutate({
      title: form.title,
      content: form.content,
      category: form.category,
      scope: form.scope,
      priority: form.priority,
      is_active: true,
    }, {
      onSuccess: () => {
        setShowCreate(false)
        setForm({ title: '', content: '', category: 'custom', scope: 'global', priority: 3 })
      }
    })
  }

  const handleUpdate = () => {
    if (!editTarget || !form.title.trim() || !form.content.trim()) return
    updateRule.mutate({
      ruleId: editTarget,
      data: {
        title: form.title,
        content: form.content,
        category: form.category,
        scope: form.scope,
        priority: form.priority,
      }
    }, {
      onSuccess: () => {
        setEditTarget(null)
        setForm({ title: '', content: '', category: 'custom', scope: 'global', priority: 3 })
      }
    })
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteRule.mutate(deleteTarget, {
      onSuccess: () => setDeleteTarget(null)
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openEdit = (rule: any) => {
    setForm({
      title: rule.title,
      content: rule.content,
      category: rule.category,
      scope: rule.scope,
      priority: rule.priority,
    })
    setEditTarget(rule.rule_id)
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">规则库</h1>
          <p className="text-sm text-gray-500 mt-1">管理世界的运行法则和约束规则</p>
        </div>
        <button
          onClick={() => { setForm({ title: '', content: '', category: 'custom', scope: 'global', priority: 3 }); setShowCreate(true) }}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + 创建规则
        </button>
      </div>

      {rules.length === 0 ? (
        <EmptyState
          icon="📜"
          title="暂无规则"
          description="创建世界的第一条运行法则"
          action={{ label: '创建规则', onClick: () => setShowCreate(true) }}
        />
      ) : (
        <div className="space-y-3">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {rules.map((rule: any) => (
            <div key={rule.rule_id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-gray-900">{rule.title}</h3>
                  <Badge label={categoryLabels[rule.category] ?? rule.category} color={categoryColors[rule.category] ?? 'gray'} />
                  <Badge label={`作用域：${rule.scope}`} color="gray" />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(rule)}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => setDeleteTarget(rule.rule_id)}
                    className="text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    删除
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{rule.content}</p>
              <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                <span>优先级：{rule.priority}</span>
                <span>状态：{rule.is_active ? '生效中' : '已停用'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="创建规则">
        <FormField label="规则标题" required>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="规则标题"
          />
        </FormField>
        <FormField label="规则内容" required>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={4}
            placeholder="详细描述规则的内容"
          />
        </FormField>
        <FormField label="分类">
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {Object.entries(categoryLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </FormField>
        <FormField label="作用域">
          <select
            value={form.scope}
            onChange={(e) => setForm({ ...form, scope: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="global">全局</option>
            <option value="faction">势力</option>
            <option value="personal">个人</option>
          </select>
        </FormField>
        <FormField label={`优先级 (${form.priority})`}>
          <input
            type="range"
            min={1} max={5}
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
            className="w-full"
          />
        </FormField>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">取消</button>
          <button
            onClick={handleCreate}
            disabled={!form.title.trim() || !form.content.trim() || createRule.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {createRule.isPending ? '创建中...' : '创建'}
          </button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="编辑规则">
        <FormField label="规则标题" required>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </FormField>
        <FormField label="规则内容" required>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={4}
          />
        </FormField>
        <FormField label="分类">
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {Object.entries(categoryLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </FormField>
        <FormField label="作用域">
          <select
            value={form.scope}
            onChange={(e) => setForm({ ...form, scope: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="global">全局</option>
            <option value="faction">势力</option>
            <option value="personal">个人</option>
          </select>
        </FormField>
        <FormField label={`优先级 (${form.priority})`}>
          <input
            type="range"
            min={1} max={5}
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
            className="w-full"
          />
        </FormField>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setEditTarget(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">取消</button>
          <button
            onClick={handleUpdate}
            disabled={!form.title.trim() || !form.content.trim() || updateRule.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {updateRule.isPending ? '保存中...' : '保存'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="删除规则"
        message="确定要删除这条规则吗？"
        confirmLabel="删除"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
    </div>
  )
}
