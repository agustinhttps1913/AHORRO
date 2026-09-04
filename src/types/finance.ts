export type TransactionType = 'income' | 'expense' | 'saving' | 'transfer'

export type Account = {
  id: string
  name: string
  type: 'cash' | 'bank' | 'wallet' | 'card' | 'investment'
  balance: number
}

export type Transaction = {
  id: string
  type: TransactionType
  amount: number
  date: string
  category: string
  description: string
  accountId: string
  paymentMethod?: string
  recurring?: boolean
}

export type Budget = {
  id: string
  category: string
  limit: number
}

export type Goal = {
  id: string
  name: string
  target: number
  saved: number
  targetDate: string
  priority: 'low' | 'medium' | 'high'
}

export type MonthlyPlan = {
  expectedIncome: number
  fixedExpenses: number
  variableExpenses: number
  savingsTarget: number
}

export type FinanceSettings = {
  name: string
  currency: 'ARS' | 'USD' | 'EUR' | 'BRL'
  darkMode: boolean
}

export type FinanceState = {
  accounts: Account[]
  transactions: Transaction[]
  budgets: Budget[]
  goals: Goal[]
  plan: MonthlyPlan
  settings: FinanceSettings
}
