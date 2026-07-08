'use client'

import { createContext, useContext } from 'react'

/**
 * Minimal window bus so any nested component (evidence folder, login screens,
 * the assistant) can open, close or focus sibling windows on the desktop —
 * enabling a real multi-window investigation workspace.
 */
export type WindowManager = {
  open: (id: string) => void
  close: (id: string) => void
  focus: (id: string) => void
  isOpen: (id: string) => boolean
}

const WindowManagerContext = createContext<WindowManager | null>(null)

export function WindowManagerProvider({
  value,
  children,
}: {
  value: WindowManager
  children: React.ReactNode
}) {
  return <WindowManagerContext.Provider value={value}>{children}</WindowManagerContext.Provider>
}

export function useWindows() {
  const ctx = useContext(WindowManagerContext)
  if (!ctx) throw new Error('useWindows must be used within WindowManagerProvider')
  return ctx
}
