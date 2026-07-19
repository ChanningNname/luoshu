import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'

export function useEntities(worldId: string, params?: { page?: number; page_size?: number; type?: string; status?: string }) {
  return useQuery({
    queryKey: ['entities', worldId, params],
    queryFn: () => apiClient.get(`/worlds/${worldId}/entities`, { params }),
    enabled: !!worldId
  })
}

export function useEntity(worldId: string, entityId: string) {
  return useQuery({
    queryKey: ['entities', worldId, entityId],
    queryFn: () => apiClient.get(`/worlds/${worldId}/entities/${entityId}`),
    enabled: !!worldId && !!entityId
  })
}

export function useCreateEntity(worldId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiClient.post(`/worlds/${worldId}/entities`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['entities', worldId] }) }
  })
}

export function useUpdateEntity(worldId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ entityId, data }: { entityId: string; data: Record<string, unknown> }) =>
      apiClient.patch(`/worlds/${worldId}/entities/${entityId}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['entities', worldId] }) }
  })
}

export function useDeleteEntity(worldId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (entityId: string) =>
      apiClient.delete(`/worlds/${worldId}/entities/${entityId}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['entities', worldId] }) }
  })
}
