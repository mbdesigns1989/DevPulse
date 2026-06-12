import { create } from "zustand"

export type User = { name: string; email: string; role: string }
export type Density = "comfortable" | "compact"

type AppState = {
  user: User
  density: Density
  setUser: (user: User) => void
  setDensity: (density: Density) => void
}

export const useAppStore = create<AppState>()((set) => ({
  user: { name: "Nour", email: "nour@devpulse.app", role: "Admin" },
  density: "comfortable",
  setUser: (user) => set({ user }),
  setDensity: (density) => set({ density }),
}))
