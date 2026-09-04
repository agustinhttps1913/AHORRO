import type { FinanceState } from '../types/finance'

const iso = (day: number) => {
  const now = new Date()
  const d = new Date(now.getFullYear(), now.getMonth(), day)
  return d.toISOString().slice(0, 10)
}

export const demoState: FinanceState = {
  accounts: [
    { id: 'a1', name: 'Banco', type: 'bank', balance: 541000 },
    { id: 'a2', name: 'Mercado Pago', type: 'wallet', balance: 171000 },
    { id: 'a3', name: 'Efectivo', type: 'cash', balance: 68500 },
  ],
  transactions: [
    { id: 't1', type: 'income', amount: 900000, date: iso(1), category: 'Sueldo', description: 'Sueldo mensual', accountId: 'a1' },
    { id: 't2', type: 'income', amount: 180000, date: iso(2), category: 'Freelance', description: 'Proyecto freelance', accountId: 'a2' },
    { id: 't3', type: 'expense', amount: 320000, date: iso(2), category: 'Vivienda', description: 'Alquiler', accountId: 'a1', recurring: true },
    { id: 't4', type: 'expense', amount: 125500, date: iso(3), category: 'Supermercado', description: 'Compra mensual', accountId: 'a2' },
    { id: 't5', type: 'expense', amount: 28000, date: iso(5), category: 'Servicios', description: 'Internet', accountId: 'a1', recurring: true },
    { id: 't6', type: 'expense', amount: 35000, date: iso(8), category: 'Gimnasio', description: 'Gimnasio', accountId: 'a2', recurring: true },
    { id: 't7', type: 'expense', amount: 14500, date: iso(10), category: 'Suscripciones', description: 'Netflix', accountId: 'a2', recurring: true },
    { id: 't8', type: 'expense', amount: 65000, date: iso(12), category: 'Transporte', description: 'Combustible y viajes', accountId: 'a2' },
    { id: 't9', type: 'saving', amount: 120000, date: iso(4), category: 'Ahorro', description: 'Fondo de emergencia', accountId: 'a1' },
  ],
  budgets: [
    { id: 'b1', category: 'Supermercado', limit: 180000 },
    { id: 'b2', category: 'Entretenimiento', limit: 90000 },
    { id: 'b3', category: 'Transporte', limit: 100000 },
    { id: 'b4', category: 'Servicios', limit: 85000 },
  ],
  goals: [
    { id: 'g1', name: 'Notebook', target: 1200000, saved: 650000, targetDate: '2027-03-01', priority: 'high' },
    { id: 'g2', name: 'Viaje', target: 1500000, saved: 420000, targetDate: '2027-07-01', priority: 'medium' },
  ],
  plan: {
    expectedIncome: 1200000,
    fixedExpenses: 500000,
    variableExpenses: 250000,
    savingsTarget: 200000,
  },
  settings: {
    name: 'Mi cuenta',
    currency: 'ARS',
    darkMode: false,
  },
}
