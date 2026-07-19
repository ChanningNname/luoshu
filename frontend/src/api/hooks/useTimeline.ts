import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'

export function useTimeline(worldId: string, params?: { page?: number; page_size?: number; scope?: string; sort?: string }) {
  return useQuery({
    queryKey: ['events', worldId, params],
    queryFn: () => apiClient.get(`/worlds/${worldId}/events`, { params }),
    enabled: !!worldId
  })
}

export function useEvent(worldId: string, eventId: string) {
  return useQuery({
    queryKey: ['events', worldId, eventId],
    queryFn: () => apiClient.get(`/worlds/${worldId}/events/${eventId}`),
    enabled: !!worldId && !!eventId
  })
}

export function useCausality(worldId: string, eventId: string) {
  return useQuery({
    queryKey: ['events', 'causality', worldId, eventId],
    queryFn: () => apiClient.get(`/worlds/${worldId}/events/causality/${eventId}`),
    enabled: !!worldId && !!eventId
  })
}

export function useCreateEvent(worldId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiClient.post(`/worlds/${worldId}/events`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['events', worldId] }) }
  })
}

export function useDeleteEvent(worldId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (eventId: string) =>
      apiClient.delete(`/worlds/${worldId}/events/${eventId}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['events', worldId] }) }
  })
}
