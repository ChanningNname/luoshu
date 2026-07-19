import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'

export function useRelations(worldId: string, params?: { page?: number; page_size?: number; dimension?: string; entity_id?: string }) {
  return useQuery({
    queryKey: ['relations', worldId, params],
    queryFn: () => apiClient.get(`/worlds/${worldId}/relations`, { params }),
    enabled: !!worldId
  })
}

export function useRelationGraph(worldId: string, entityId?: string) {
  return useQuery({
    queryKey: ['relations', 'graph', worldId, entityId],
    queryFn: () => apiClient.get(`/worlds/${worldId}/relations/graph`, {
      params: entityId ? { entity_id: entityId } : undefined
    }),
    enabled: !!worldId
  })
}

export function useCreateRelation(worldId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiClient.post(`/worlds/${worldId}/relations`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['relations', worldId] }) }
  })
}

export function useDeleteRelation(worldId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (relationId: string) =>
      apiClient.delete(`/worlds/${worldId}/relations/${relationId}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['relations', worldId] }) }
  })
}
