import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'

export function useMemories(worldId: string, entityId: string, params?: { page?: number; page_size?: number; type?: string }) {
  return useQuery({
    queryKey: ['memories', worldId, entityId, params],
    queryFn: () => apiClient.get(`/worlds/${worldId}/entities/${entityId}/memories`, { params }),
    enabled: !!worldId && !!entityId
  })
}

export function useCreateMemory(worldId: string, entityId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiClient.post(`/worlds/${worldId}/entities/${entityId}/memories`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['memories', worldId, entityId] }) }
  })
}

export function useUpdateMemory(worldId: string, entityId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ memoryId, data }: { memoryId: string; data: Record<string, unknown> }) =>
      apiClient.patch(`/worlds/${worldId}/entities/${entityId}/memories/${memoryId}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['memories', worldId, entityId] }) }
  })
}

export function useDeleteMemory(worldId: string, entityId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (memoryId: string) =>
      apiClient.delete(`/worlds/${worldId}/entities/${entityId}/memories/${memoryId}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['memories', worldId, entityId] }) }
  })
}
