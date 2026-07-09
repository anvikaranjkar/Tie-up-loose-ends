'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react'
import type { ScreenId } from '@/lib/loose-ends/data'
import { TOTAL_CLUES } from '@/lib/loose-ends/data'

const SAVE_KEY = 'final-farewell:save:v1'

type State = {
  screen: ScreenId
  clues: string[] // discovered clue ids
  solved: string[] // account ids successfully accessed
  failures: number // total failed attempts (drives fatigue too)
  fatigue: number // 0-100 Administrative Fatigue
  pinned: string[] // clue ids pinned to the top of the evidence folder
  important: string[] // clue ids flagged as important
}

type Action =
  | { type: 'goto'; screen: ScreenId }
  | { type: 'collect'; clueId: string }
  | { type: 'solve'; accountId: string }
  | { type: 'fatigue'; delta: number }
  | { type: 'fail' }
  | { type: 'resolve' }
  | { type: 'reset' }
  | { type: 'hydrate'; state: State }
  | { type: 'togglePin'; clueId: string }
  | { type: 'toggleImportant'; clueId: string }

const INITIAL_STATE: State = {
  screen: 'intro',
  clues: [],
  solved: [],
  failures: 0,
  fatigue: 6,
  pinned: [],
  important: [],
}

/** Read a persisted save, tolerating older/corrupt payloads. */
function loadSave(): State | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<State>
    if (!parsed || typeof parsed !== 'object' || !parsed.screen) return null
    return { ...INITIAL_STATE, ...parsed }
  } catch {
    return null
  }
}

function toggle(list: string[], id: string) {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
}

function clamp(n: number) {
  return Math.max(0, Math.min(100, n))
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'goto':
      return { ...state, screen: action.screen }
    case 'collect': {
      if (state.clues.includes(action.clueId)) return state
      return { ...state, clues: [...state.clues, action.clueId] }
    }
    case 'solve': {
      if (state.solved.includes(action.accountId)) return state
      // Success gently relieves a little fatigue — progress feels good.
      return {
        ...state,
        solved: [...state.solved, action.accountId],
        fatigue: clamp(state.fatigue - 4),
      }
    }
    case 'fail':
      return { ...state, failures: state.failures + 1, fatigue: clamp(state.fatigue + 9) }
    case 'fatigue':
      return { ...state, fatigue: clamp(state.fatigue + action.delta) }
    case 'resolve':
      return { ...state, fatigue: 0, screen: 'final' }
    case 'reset':
      return INITIAL_STATE
    case 'hydrate':
      return action.state
    case 'togglePin':
      return { ...state, pinned: toggle(state.pinned, action.clueId) }
    case 'toggleImportant':
      return { ...state, important: toggle(state.important, action.clueId) }
    default:
      return state
  }
}

type Store = State & {
  totalClues: number
  hasClue: (id: string) => boolean
  hydrated: boolean // true once localStorage has been read on the client
  hasSave: boolean // a resumable, in-progress save exists
  goto: (screen: ScreenId) => void
  collect: (clueId: string) => void
  solve: (accountId: string) => void
  fail: () => void
  addFatigue: (delta: number) => void
  resolve: () => void
  reset: () => void
  restart: () => void // clear the save and return to a fresh intro
  continueSaved: () => void // jump to the saved screen
  togglePin: (clueId: string) => void
  toggleImportant: (clueId: string) => void
}

const GameContext = createContext<Store | null>(null)

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  const [hydrated, setHydrated] = useState(false)
  const [savedScreen, setSavedScreen] = useState<ScreenId | null>(null)

  // Read any persisted save once, on the client, to avoid SSR hydration drift.
  useEffect(() => {
    const saved = loadSave()
    if (saved) {
      setSavedScreen(saved.screen)
      // Keep the player on the main menu; they choose Continue or Restart.
      dispatch({ type: 'hydrate', state: { ...saved, screen: 'intro' } })
    }
    setHydrated(true)
  }, [])

  // Persist after every change (once hydrated), skipping the empty intro state.
  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return
    const isFresh = state.screen === 'intro' && state.clues.length === 0 && state.solved.length === 0
    try {
      if (isFresh) window.localStorage.removeItem(SAVE_KEY)
      else window.localStorage.setItem(SAVE_KEY, JSON.stringify(state))
    } catch {
      /* storage full or blocked — progress simply won't persist */
    }
  }, [state, hydrated])

  const goto = useCallback((screen: ScreenId) => dispatch({ type: 'goto', screen }), [])
  const collect = useCallback((clueId: string) => dispatch({ type: 'collect', clueId }), [])
  const solve = useCallback((accountId: string) => dispatch({ type: 'solve', accountId }), [])
  const fail = useCallback(() => dispatch({ type: 'fail' }), [])
  const addFatigue = useCallback((delta: number) => dispatch({ type: 'fatigue', delta }), [])
  const resolve = useCallback(() => dispatch({ type: 'resolve' }), [])
  const reset = useCallback(() => dispatch({ type: 'reset' }), [])
  const restart = useCallback(() => {
    setSavedScreen(null)
    try {
      window.localStorage.removeItem(SAVE_KEY)
    } catch {
      /* ignore */
    }
    dispatch({ type: 'reset' })
  }, [])
  const continueSaved = useCallback(() => {
    if (savedScreen) dispatch({ type: 'goto', screen: savedScreen })
  }, [savedScreen])
  const togglePin = useCallback((clueId: string) => dispatch({ type: 'togglePin', clueId }), [])
  const toggleImportant = useCallback((clueId: string) => dispatch({ type: 'toggleImportant', clueId }), [])

  // A save is only worth resuming if it points somewhere past the intro.
  const hasSave = savedScreen != null && savedScreen !== 'intro'

  const value = useMemo<Store>(
    () => ({
      ...state,
      totalClues: TOTAL_CLUES,
      hasClue: (id: string) => state.clues.includes(id),
      hydrated,
      hasSave,
      goto,
      collect,
      solve,
      fail,
      addFatigue,
      resolve,
      reset,
      restart,
      continueSaved,
      togglePin,
      toggleImportant,
    }),
    [state, hydrated, hasSave, goto, collect, solve, fail, addFatigue, resolve, reset, restart, continueSaved, togglePin, toggleImportant],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}
