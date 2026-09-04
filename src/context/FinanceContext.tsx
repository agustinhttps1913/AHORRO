import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { demoState } from '../lib/demo'
import { clearFinanceState, readFinanceState, writeFinanceState } from '../lib/storage'
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

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FinanceState>(emptyState)
  const [dataLoading, setDataLoading] = useState(true)
  const hydrated = useRef(false)

  useEffect(() => {
    void (async () => {
      const saved = await readFinanceState()
      if (saved) setState(saved)
      hydrated.current = true
      setDataLoading(false)
    })()
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.settings.darkMode)
    if (!hydrated.current) return
    void writeFinanceState(state)
  }, [state])

  const value = useMemo<FinanceContextValue>(() => ({
    ...state,
    dataLoading,
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
      void clearFinanceState()
    },
    loadDemo: () => setState(demoState),
  }), [state, dataLoading])

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}

export function useFinance() {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error('useFinance debe usarse dentro de FinanceProvider')
  return ctx
}
