import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'

export function useRules(worldId: string, params?: { page?: number; page_size?: number; category?: string }) {
  return useQuery({
    queryKey: ['rules', worldId, params],
    queryFn: () => apiClient.get(`/worlds/${worldId}/rules`, { params }),
    enabled: !!worldId
  })
}

export function useCreateRule(worldId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiClient.post(`/worlds/${worldId}/rules`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['rules', worldId] }) }
  })
}

export function useUpdateRule(worldId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ ruleId, data }: { ruleId: string; data: Record<string, unknown> }) =>
      apiClient.patch(`/worlds/${worldId}/rules/${ruleId}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['rules', worldId] }) }
  })
}

export function useDeleteRule(worldId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ruleId: string) =>
      apiClient.delete(`/worlds/${worldId}/rules/${ruleId}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['rules', worldId] }) }
  })
}
