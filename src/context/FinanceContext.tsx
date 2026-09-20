import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { demoState } from '../lib/demo'
import { supabase } from '../lib/supabase'
import type { Account, Budget, FinanceState, Goal, MonthlyPlan, Transaction } from '../types/finance'

export const emptyState: FinanceState = {
  accounts: [{ id: 'main-account', name: 'Cuenta principal', type: 'bank', balance: 0 }],
  transactions: [],
  budgets: [],
  goals: [],
  plan: { expectedIncome: 0, fixedExpenses: 0, variableExpenses: 0, savingsTarget: 0 },
  settings: { name: 'Mi cuenta', currency: 'ARS', darkMode: false },
}

type FinanceContextValue = FinanceState & {
  dataLoading: boolean
  syncStatus: string
  syncError: boolean
  exportUnsaved: () => void
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void
  deleteTransaction: (id: string) => void
  addAccount: (account: Omit<Account, 'id'>) => void
  setBudget: (category: string, limit: number) => void
  addGoal: (goal: Omit<Goal, 'id'>) => void
  contributeToGoal: (goalId: string, amount: number) => void
  updatePlan: (plan: MonthlyPlan) => void
  updateSettings: (patch: Partial<FinanceState['settings']>) => void
  importBackup: (next: FinanceState) => void
  clearAll: () => void
  loadDemo: () => void
}

const FinanceContext = createContext<FinanceContextValue | null>(null)

export function FinanceProvider({ children, userId }: { children: ReactNode; userId: string }) {
  const [state, setState] = useState<FinanceState>(emptyState)
  const [dataLoading, setDataLoading] = useState(true)
  const [syncStatus, setSyncStatus] = useState('Cargando datos…')
  const [syncError, setSyncError] = useState(false)
  const hydrated = useRef(false)
  const saved = useRef<FinanceState>(emptyState)
  const revision = useRef(0)
  const queue = useRef(Promise.resolve())
  const failed = useRef(false)
  const latest = useRef(state)
  latest.current = state
  const backupKey = `ahorro-pending-${userId}`

  function exportUnsaved() {
    const blob = new Blob([JSON.stringify(latest.current, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url; link.download = `ahorro-respaldo-${new Date().toISOString().slice(0, 10)}.json`
    link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  useEffect(() => {
    let active = true
    void (async () => {
      try {
        if (!supabase) throw new Error('Sin conexión configurada')
        const { data, error } = await supabase.from('finance_documents').select('state, revision').eq('user_id', userId).maybeSingle()
        if (error) throw error
        if (!active) return
        const next = (data?.state as FinanceState | undefined) ?? emptyState
        revision.current = data?.revision ?? 0
        saved.current = next
        let pending: FinanceState | null = null
        try {
          const raw = localStorage.getItem(backupKey)
          if (raw) pending = JSON.parse(raw) as FinanceState
        } catch { /* The cloud remains the source of truth. */ }
        if (pending && JSON.stringify(pending) !== JSON.stringify(next)) {
          setState(pending)
          failed.current = true
          setSyncError(true)
          setSyncStatus('Hay cambios pendientes de una sesión anterior. Descargá el respaldo antes de cargar la versión de la nube.')
        } else {
          setState(next)
          setSyncStatus('Guardado en la nube')
          try { localStorage.removeItem(backupKey) } catch { /* Optional recovery copy. */ }
        }
        hydrated.current = true
      } catch {
        if (!active) return
        failed.current = true
        setSyncError(true)
        setSyncStatus('No se pudieron cargar tus datos. Revisá la conexión y recargá. No se reemplazó nada en la nube.')
      } finally { if (active) setDataLoading(false) }
    })()
    return () => { active = false }
  }, [userId, backupKey])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.settings.darkMode)
    if (!hydrated.current || state === saved.current || failed.current) return
    try { localStorage.setItem(backupKey, JSON.stringify(state)) } catch { /* Surface server failures below. */ }
    setSyncStatus('Guardando…')
    queue.current = queue.current.then(async () => {
      if (failed.current || !supabase) return
      try {
        const { data: auth, error: authError } = await supabase.auth.getSession()
        if (authError || auth.session?.user.id !== userId) throw new Error('La sesión cambió')
        const { data, error } = await supabase.rpc('save_finance_document', { p_state: state, p_revision: revision.current, p_user_id: userId })
        if (error) throw error
        revision.current = Number(data)
        saved.current = state
        if (latest.current === state) {
          try { localStorage.removeItem(backupKey) } catch { /* Optional recovery copy. */ }
          setSyncStatus('Guardado en la nube')
        }
      } catch (error) {
        failed.current = true
        setSyncError(true)
        const conflict = typeof error === 'object' && error !== null && 'message' in error && String(error.message).includes('FINANCE_CONFLICT')
        setSyncStatus(conflict
          ? 'Hay una versión más reciente en otro dispositivo. Descargá tus cambios antes de cargar la versión de la nube.'
          : 'No se pudieron guardar los cambios. Descargá un respaldo antes de cerrar o recargar.')
      }
    })
  }, [state, userId, backupKey])

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (hydrated.current && latest.current !== saved.current) { event.preventDefault(); event.returnValue = '' }
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [])

  const value = useMemo<FinanceContextValue>(() => ({
    ...state,
    dataLoading,
    syncStatus,
    syncError,
    exportUnsaved,
    addTransaction: (input) => {
      const tx: Transaction = { ...input, id: crypto.randomUUID() }
      setState((s) => {
        const accounts = s.accounts.map((a) => {
          if (a.id !== tx.accountId || tx.type === 'transfer') return a
          const delta = tx.type === 'income' ? tx.amount : -tx.amount
          return { ...a, balance: a.balance + delta }
        })
        return { ...s, accounts, transactions: [tx, ...s.transactions] }
      })
    },
    deleteTransaction: (id) => {
      setState((s) => {
        const tx = s.transactions.find((t) => t.id === id)
        if (!tx) return s
        const accounts = s.accounts.map((a) => {
          if (a.id !== tx.accountId || tx.type === 'transfer') return a
          const reversal = tx.type === 'income' ? -tx.amount : tx.amount
          return { ...a, balance: a.balance + reversal }
        })
        return { ...s, accounts, transactions: s.transactions.filter((t) => t.id !== id) }
      })
    },
    addAccount: (account) => {
      const item: Account = { ...account, id: crypto.randomUUID() }
      setState((s) => ({ ...s, accounts: [...s.accounts, item] }))
    },
    setBudget: (category, limit) => {
      setState((s) => {
        const existing = s.budgets.find((b) => b.category.toLowerCase() === category.toLowerCase())
        const item: Budget = existing ? { ...existing, limit } : { id: crypto.randomUUID(), category, limit }
        return {
          ...s,
          budgets: existing ? s.budgets.map((b) => b.id === existing.id ? item : b) : [...s.budgets, item],
        }
      })
    },
    addGoal: (goal) => {
      const item: Goal = { ...goal, id: crypto.randomUUID() }
      setState((s) => ({ ...s, goals: [...s.goals, item] }))
    },
    contributeToGoal: (goalId, amount) => {
      setState((s) => ({
        ...s,
        goals: s.goals.map((g) => g.id === goalId ? { ...g, saved: Math.min(g.target, g.saved + amount) } : g),
      }))
    },
    updatePlan: (plan) => setState((s) => ({ ...s, plan })),
    updateSettings: (patch) => setState((s) => ({ ...s, settings: { ...s.settings, ...patch } })),
    importBackup: (next) => setState(next),
    clearAll: () => {
      setState(emptyState)

    },
    loadDemo: () => setState(demoState),
  }), [state, dataLoading, syncStatus, syncError])

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}

export function useFinance() {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error('useFinance debe usarse dentro de FinanceProvider')
  return ctx
}
