import { create } from 'zustand'

interface WorldState {
  currentWorldId: string | null
  setCurrentWorld: (id: string) => void
}

export const useWorldStore = create<WorldState>((set) => ({
  currentWorldId: null,
  setCurrentWorld: (id) => set({ currentWorldId: id }),
}))
