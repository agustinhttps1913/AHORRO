import type { FinanceState } from '../types/finance'

export function currentMonthTransactions(transactions: FinanceState['transactions']) {
  const now = new Date()
  return transactions.filter((t) => {
    const d = new Date(`${t.date}T12:00:00`)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
}

export function financeStats(state: Pick<FinanceState, 'transactions' | 'accounts'>) {
  const month = currentMonthTransactions(state.transactions)
  const income = month.filter((t) => t.type === 'income').reduce((a, b) => a + b.amount, 0)
  const expenses = month.filter((t) => t.type === 'expense').reduce((a, b) => a + b.amount, 0)
  const savings = month.filter((t) => t.type === 'saving').reduce((a, b) => a + b.amount, 0)
  const balance = state.accounts.reduce((a, b) => a + b.balance, 0)
  const savingsRate = income > 0 ? (savings / income) * 100 : 0
  return { month, income, expenses, savings, balance, savingsRate, available: income - expenses - savings }
}

export function categoryTotals(transactions: FinanceState['transactions']) {
  const totals = new Map<string, number>()
  currentMonthTransactions(transactions)
    .filter((t) => t.type === 'expense')
    .forEach((t) => totals.set(t.category, (totals.get(t.category) ?? 0) + t.amount))
  return [...totals.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
}
