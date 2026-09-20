import { AuthGate } from './components/AuthGate'
import { supabase } from './lib/supabase'
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
  return <AuthGate>{userId => <FinanceProvider key={userId} userId={userId}><AppGate /></FinanceProvider>}</AuthGate>
}

function AppGate() {
  const { dataLoading, syncStatus, syncError, exportUnsaved } = useFinance()
  if (dataLoading) {
    return <div className="grid min-h-screen place-items-center bg-[#f5f7fb] dark:bg-slate-950"><Loader2 className="animate-spin text-slate-400"/></div>
  }

  if (syncError) return <main className="mx-auto max-w-lg space-y-4 p-6">
    <h1 className="text-xl font-bold">Revisá el guardado de tus datos</h1>
    <p role="alert">{syncStatus}</p>
    <button className="block underline" onClick={exportUnsaved}>Descargar respaldo de esta sesión</button>
    <button className="block underline" onClick={async () => {
      if (!window.confirm('¿Ya descargaste el respaldo? Se cargarán los datos de la nube y se descartarán los cambios pendientes de este dispositivo.')) return
      const { data } = await supabase!.auth.getSession()
      if (data.session) localStorage.removeItem(`ahorro-pending-${data.session.user.id}`)
      window.location.reload()
    }}>Cargar versión de la nube</button>
  </main>

  return <><div className="flex items-center justify-between gap-3 bg-slate-100 px-4 py-2 text-xs text-slate-700">
    <span role="status">{syncStatus}</span>
    <button disabled={syncStatus !== 'Guardado en la nube'} onClick={async () => {
      const { error } = await supabase!.auth.signOut({ scope: 'local' })
      if (error) window.alert('No se pudo cerrar la sesión. Intentá de nuevo.')
    }}>Cerrar sesión</button>
  </div><HashRouter><Routes><Route element={<AppLayout/>}><Route index element={<DashboardPage/>}/><Route path="calendario" element={<CalendarPage/>}/><Route path="movimientos" element={<TransactionsPage/>}/><Route path="planificacion" element={<PlanningPage/>}/><Route path="presupuestos" element={<BudgetsPage/>}/><Route path="ahorros" element={<SavingsPage/>}/><Route path="gastos-fijos" element={<RecurringPage/>}/><Route path="objetivos" element={<GoalsPage/>}/><Route path="cuentas" element={<AccountsPage/>}/><Route path="analisis" element={<AnalysisPage/>}/><Route path="configuracion" element={<SettingsPage/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Route></Routes></HashRouter></>
}
