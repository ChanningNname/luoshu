import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'

export function useChapters(worldId: string, params?: { page?: number; page_size?: number; status?: string }) {
  return useQuery({
    queryKey: ['chapters', worldId, params],
    queryFn: () => apiClient.get(`/worlds/${worldId}/chapters`, { params }),
    enabled: !!worldId
  })
}

export function useChapter(worldId: string, chapterId: string) {
  return useQuery({
    queryKey: ['chapters', worldId, chapterId],
    queryFn: () => apiClient.get(`/worlds/${worldId}/chapters/${chapterId}`),
    enabled: !!worldId && !!chapterId
  })
}

export function useChapterContext(worldId: string, chapterId: string) {
  return useQuery({
    queryKey: ['chapters', 'context', worldId, chapterId],
    queryFn: () => apiClient.get(`/worlds/${worldId}/chapters/${chapterId}/context`),
    enabled: !!worldId && !!chapterId
  })
}

export function useCreateChapter(worldId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiClient.post(`/worlds/${worldId}/chapters`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['chapters', worldId] }) }
  })
}

export function useUpdateChapter(worldId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ chapterId, data }: { chapterId: string; data: Record<string, unknown> }) =>
      apiClient.patch(`/worlds/${worldId}/chapters/${chapterId}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['chapters', worldId] }) }
  })
}

export function useDeleteChapter(worldId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (chapterId: string) =>
      apiClient.delete(`/worlds/${worldId}/chapters/${chapterId}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['chapters', worldId] }) }
  })
}
