import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { AppLayout } from './components/AppLayout'
import { FinanceProvider, useFinance } from './context/FinanceContext'
import { AccountsPage } from './pages/AccountsPage'
import { AnalysisPage } from './pages/AnalysisPage'
import { BudgetsPage } from './pages/BudgetsPage'
import { CalendarPage } from './pages/CalendarPage'
import { DashboardPage } from './pages/DashboardPage'
import { GoalsPage } from './pages/GoalsPage'
import { PlanningPage } from './pages/PlanningPage'
import { RecurringPage } from './pages/RecurringPage'
import { SavingsPage } from './pages/SavingsPage'
import { SettingsPage } from './pages/SettingsPage'
import { TransactionsPage } from './pages/TransactionsPage'

export default function App() {
  return <FinanceProvider><AppGate /></FinanceProvider>
}

function AppGate() {
  const { dataLoading } = useFinance()
  if (dataLoading) {
    return <div className="grid min-h-screen place-items-center bg-[#f5f7fb] dark:bg-slate-950"><Loader2 className="animate-spin text-slate-400"/></div>
  }

  return <HashRouter><Routes><Route element={<AppLayout/>}><Route index element={<DashboardPage/>}/><Route path="calendario" element={<CalendarPage/>}/><Route path="movimientos" element={<TransactionsPage/>}/><Route path="planificacion" element={<PlanningPage/>}/><Route path="presupuestos" element={<BudgetsPage/>}/><Route path="ahorros" element={<SavingsPage/>}/><Route path="gastos-fijos" element={<RecurringPage/>}/><Route path="objetivos" element={<GoalsPage/>}/><Route path="cuentas" element={<AccountsPage/>}/><Route path="analisis" element={<AnalysisPage/>}/><Route path="configuracion" element={<SettingsPage/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Route></Routes></HashRouter>
}
