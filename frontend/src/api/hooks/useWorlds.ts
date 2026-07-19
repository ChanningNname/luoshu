import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'

export function useWorlds(params?: { page?: number; page_size?: number; status?: string }) {
  return useQuery({
    queryKey: ['worlds', params],
    queryFn: () => apiClient.get('/worlds', { params })
  })
}

export function useWorld(worldId: string) {
  return useQuery({
    queryKey: ['worlds', worldId],
    queryFn: () => apiClient.get(`/worlds/${worldId}`),
    enabled: !!worldId
  })
}

export function useCreateWorld() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => apiClient.post('/worlds', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['worlds'] }) }
  })
}

export function useUpdateWorld() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ worldId, data }: { worldId: string; data: Record<string, unknown> }) =>
      apiClient.patch(`/worlds/${worldId}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['worlds'] }) }
  })
}

export function useDeleteWorld() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (worldId: string) => apiClient.delete(`/worlds/${worldId}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['worlds'] }) }
  })
}
