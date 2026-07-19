import { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'
import { useRelationGraph, useRelations, useEntities, useCreateRelation, useDeleteRelation } from '../api/hooks'
import { useWorldStore } from '../stores/worldStore'
import Modal from '../components/shared/Modal'
import FormField from '../components/shared/FormField'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import EmptyState from '../components/shared/EmptyState'
import Badge from '../components/shared/Badge'

const dimensionColors: Record<string, string> = {
  mentor: '#f59e0b',
  emotion: '#ef4444',
  organization: '#3b82f6',
  possession: '#10b981',
  rivalry: '#8b5cf6',
  alliance: '#06b6d4',
}

const dimensionLabels: Record<string, string> = {
  mentor: '师承',
  emotion: '情感',
  organization: '组织',
  possession: '持有',
  rivalry: '敌对',
  alliance: '联盟',
}

const typeColors: Record<string, string> = {
  character: '#3b82f6',
  item: '#10b981',
  faction: '#8b5cf6',
}

export default function RelationsPage() {
  const { currentWorldId } = useWorldStore()
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [dimensionFilter, setDimensionFilter] = useState<string[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({
    source_entity_id: '', target_entity_id: '', dimension: 'emotion',
    relation_type: '', strength: 5, description: ''
  })

  const { data: graphRes, isLoading: graphLoading } = useRelationGraph(currentWorldId ?? '')
  const { data: relationsRes } = useRelations(currentWorldId ?? '', { entity_id: selectedNode ?? undefined })
  const { data: entitiesRes } = useEntities(currentWorldId ?? '', { page_size: 100 })
  const createRelation = useCreateRelation(currentWorldId ?? '')
  const deleteRelation = useDeleteRelation(currentWorldId ?? '')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const graphData = (graphRes as any)?.data ?? { nodes: [], edges: [] }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const relations: any[] = (relationsRes as any)?.data?.items ?? []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const entities: any[] = (entitiesRes as any)?.data?.items ?? []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const entityMap = new Map(entities.map((e: any) => [e.entity_id, e]))

  const renderGraph = useCallback(() => {
    if (!svgRef.current || !graphData.nodes.length) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight

    const g = svg.append('g')

    // Zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => g.attr('transform', event.transform))
    svg.call(zoom)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let edges = graphData.edges as any[]
    if (dimensionFilter.length > 0) {
      edges = edges.filter((e: { dimension: string }) => dimensionFilter.includes(e.dimension))
    }

    const nodeIds = new Set<string>()
    edges.forEach((e: { source: string; target: string }) => { nodeIds.add(e.source); nodeIds.add(e.target) })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nodes = graphData.nodes
      .filter((n: { entity_id: string }) => dimensionFilter.length === 0 || nodeIds.has(n.entity_id))
      .map((n: { entity_id: string }) => ({ ...n, id: n.entity_id }))

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(edges).id((d: any) => d.id).distance(120))  // eslint-disable-line @typescript-eslint/no-explicit-any
      .force('charge', d3.forceManyBody().strength(-250))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide(40))

    // Links
    const link = g.append('g')
      .selectAll('line')
      .data(edges)
      .enter()
      .append('line')
      .attr('stroke', (d: { dimension: string }) => dimensionColors[d.dimension] ?? '#999')
      .attr('stroke-width', (d: { strength: number }) => Math.max(1, d.strength / 3))
      .attr('stroke-opacity', 0.6)

    // Nodes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const node = g.append('g')
      .selectAll<SVGCircleElement, any>('circle')  // eslint-disable-line @typescript-eslint/no-explicit-any
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', 18)
      .attr('fill', (d: any) => {  // eslint-disable-line @typescript-eslint/no-explicit-any
        const entity = entityMap.get(d.entity_id)
        return entity ? (typeColors[entity.type] ?? '#6b7280') : '#6b7280'
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('click', (_event: any, d: any) => {  // eslint-disable-line @typescript-eslint/no-explicit-any
        setSelectedNode(d.entity_id)
      })
      .call(d3.drag<SVGCircleElement, any>()  // eslint-disable-line @typescript-eslint/no-explicit-any
        .on('start', (event) => {
          if (!event.active) simulation.alphaTarget(0.3).restart()
          event.subject.fx = event.subject.x
          event.subject.fy = event.subject.y
        })
        .on('drag', (event) => {
          event.subject.fx = event.x
          event.subject.fy = event.y
        })
        .on('end', (event) => {
          if (!event.active) simulation.alphaTarget(0)
          event.subject.fx = null
          event.subject.fy = null
        })
      )

    // Labels
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const labels = g.append('g')
      .selectAll<SVGTextElement, any>('text')  // eslint-disable-line @typescript-eslint/no-explicit-any
      .data(nodes)
      .enter()
      .append('text')
      .text((d: any) => entityMap.get(d.entity_id)?.name ?? d.entity_id)  // eslint-disable-line @typescript-eslint/no-explicit-any
      .attr('font-size', 11)
      .attr('text-anchor', 'middle')
      .attr('dy', 32)
      .attr('fill', '#374151')

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)  // eslint-disable-line @typescript-eslint/no-explicit-any
        .attr('y1', (d: any) => d.source.y)  // eslint-disable-line @typescript-eslint/no-explicit-any
        .attr('x2', (d: any) => d.target.x)  // eslint-disable-line @typescript-eslint/no-explicit-any
        .attr('y2', (d: any) => d.target.y)  // eslint-disable-line @typescript-eslint/no-explicit-any

      node
        .attr('cx', (d: any) => d.x)  // eslint-disable-line @typescript-eslint/no-explicit-any
        .attr('cy', (d: any) => d.y)  // eslint-disable-line @typescript-eslint/no-explicit-any

      labels
        .attr('x', (d: any) => d.x)  // eslint-disable-line @typescript-eslint/no-explicit-any
        .attr('y', (d: any) => d.y)  // eslint-disable-line @typescript-eslint/no-explicit-any
    })

    return () => { simulation.stop() }
  }, [graphData, dimensionFilter, entityMap])

  useEffect(() => {
    const cleanup = renderGraph()
    return () => { cleanup?.() }
  }, [renderGraph])

  if (!currentWorldId) {
    return <EmptyState icon="🌍" title="请先选择一个世界" description="在顶部导航栏选择世界" />
  }

  const handleCreate = () => {
    if (!form.source_entity_id || !form.target_entity_id || !form.relation_type) return
    createRelation.mutate({
      source_entity_id: form.source_entity_id,
      target_entity_id: form.target_entity_id,
      dimension: form.dimension,
      relation_type: form.relation_type,
      strength: form.strength,
      description: form.description,
    }, {
      onSuccess: () => {
        setShowCreate(false)
        setForm({ source_entity_id: '', target_entity_id: '', dimension: 'emotion', relation_type: '', strength: 5, description: '' })
      }
    })
  }

  const toggleDimension = (dim: string) => {
    setDimensionFilter(prev =>
      prev.includes(dim) ? prev.filter(d => d !== dim) : [...prev, dim]
    )
  }

  if (graphLoading) return <LoadingSpinner />

  return (
    <div className="h-full flex flex-col -m-6">
      {/* Top filter bar */}
      <div className="flex items-center gap-2 px-6 py-3 bg-white border-b border-gray-200">
        <span className="text-sm text-gray-600 mr-2">维度筛选：</span>
        {Object.entries(dimensionLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => toggleDimension(key)}
            className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
              dimensionFilter.includes(key) || dimensionFilter.length === 0
                ? 'text-white'
                : 'text-gray-400 bg-gray-100'
            }`}
            style={dimensionFilter.includes(key) || dimensionFilter.length === 0
              ? { backgroundColor: dimensionColors[key] }
              : undefined
            }
          >
            {label}
          </button>
        ))}
        <div className="flex-1" />
        <button
          onClick={() => setShowCreate(true)}
          className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          + 添加关系
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex min-h-0">
        {/* Graph area */}
        <div className="flex-1 relative">
          <svg ref={svgRef} className="w-full h-full bg-gray-50" />
        </div>

        {/* Right panel */}
        {selectedNode && (
          <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">
                {entityMap.get(selectedNode)?.name ?? '未知实体'}
              </h3>
              <button onClick={() => setSelectedNode(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              {entityMap.get(selectedNode)?.description}
            </p>
            <h4 className="text-sm font-medium text-gray-700 mb-2">关系列表</h4>
            {relations.length === 0 ? (
              <p className="text-xs text-gray-400">暂无关系</p>
            ) : (
              <div className="space-y-2">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {relations.map((rel: any) => {
                  const targetId = rel.source_entity_id === selectedNode ? rel.target_entity_id : rel.source_entity_id
                  const targetName = entityMap.get(targetId)?.name ?? targetId
                  return (
                    <div key={rel.relation_id} className="p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">{targetName}</span>
                        <button
                          onClick={() => deleteRelation.mutate(rel.relation_id)}
                          className="text-gray-400 hover:text-red-500 text-xs"
                        >
                          删除
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge label={dimensionLabels[rel.dimension] ?? rel.dimension} color="indigo" />
                        <span className="text-xs text-gray-500">{rel.relation_type}</span>
                        <span className="text-xs text-gray-400">强度 {rel.strength}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Relation Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="添加关系">
        <FormField label="源实体" required>
          <select
            value={form.source_entity_id}
            onChange={(e) => setForm({ ...form, source_entity_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">选择实体</option>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {entities.map((e: any) => <option key={e.entity_id} value={e.entity_id}>{e.name}</option>)}
          </select>
        </FormField>
        <FormField label="目标实体" required>
          <select
            value={form.target_entity_id}
            onChange={(e) => setForm({ ...form, target_entity_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">选择实体</option>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {entities.map((e: any) => <option key={e.entity_id} value={e.entity_id}>{e.name}</option>)}
          </select>
        </FormField>
        <FormField label="维度" required>
          <select
            value={form.dimension}
            onChange={(e) => setForm({ ...form, dimension: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {Object.entries(dimensionLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </FormField>
        <FormField label="关系类型" required>
          <input
            type="text"
            value={form.relation_type}
            onChange={(e) => setForm({ ...form, relation_type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="例如：师徒、恋人、持有"
          />
        </FormField>
        <FormField label={`强度 (${form.strength})`}>
          <input
            type="range"
            min={1} max={10}
            value={form.strength}
            onChange={(e) => setForm({ ...form, strength: Number(e.target.value) })}
            className="w-full"
          />
        </FormField>
        <FormField label="描述">
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={2}
          />
        </FormField>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">取消</button>
          <button
            onClick={handleCreate}
            disabled={!form.source_entity_id || !form.target_entity_id || !form.relation_type || createRelation.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {createRelation.isPending ? '创建中...' : '创建'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
