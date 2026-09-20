import { useState, type ElementType } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { BarChart3, CalendarDays, CircleDollarSign, Goal, Home, Landmark, LayoutGrid, Menu, PiggyBank, Plus, Repeat2, Settings, SlidersHorizontal, WalletCards, X } from 'lucide-react'
import { AddTransactionModal } from './AddTransactionModal'
import { useFinance } from '../context/FinanceContext'

const nav = [
  { to: '/', label: 'Inicio', icon: Home },
  { to: '/calendario', label: 'Calendario', icon: CalendarDays },
  { to: '/movimientos', label: 'Movimientos', icon: WalletCards },
  { to: '/planificacion', label: 'Planificación', icon: SlidersHorizontal },
  { to: '/presupuestos', label: 'Presupuestos', icon: LayoutGrid },
  { to: '/ahorros', label: 'Ahorros', icon: PiggyBank },
  { to: '/gastos-fijos', label: 'Gastos fijos', icon: Repeat2 },
  { to: '/objetivos', label: 'Objetivos', icon: Goal },
  { to: '/cuentas', label: 'Cuentas', icon: Landmark },
  { to: '/analisis', label: 'Análisis', icon: BarChart3 },
  { to: '/configuracion', label: 'Configuración', icon: Settings },
]

export function AppLayout() {
  const [addOpen, setAddOpen] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const { settings } = useFinance()

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200/80 bg-white/90 px-4 py-5 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90 lg:block">
        <Brand />
        <nav className="mt-8 space-y-1">{nav.map((item) => <DesktopLink key={item.to} {...item} />)}</nav>
        <div className="absolute bottom-5 left-4 right-4 rounded-2xl bg-slate-100 p-3 text-xs text-slate-500 dark:bg-slate-900 dark:text-slate-400">
          <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200"><CircleDollarSign size={15}/> Datos sólo en este dispositivo</div>
          <p className="mt-1">Sin login, sin nube y sin sincronización externa.</p>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/70 bg-[#f5f7fb]/90 px-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90 lg:ml-64 lg:px-8">
        <div className="flex items-center gap-3 lg:hidden"><Brand compact /></div>
        <div className="hidden lg:block"><p className="text-sm text-slate-500 dark:text-slate-400">Hola, {settings.name}</p></div>
        <div className="flex items-center gap-2">
          <button onClick={() => setAddOpen(true)} className="hidden rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950 sm:inline-flex"><Plus size={18}/> Nuevo movimiento</button>
          <button className="rounded-xl p-2 hover:bg-white dark:hover:bg-slate-900 lg:hidden" onClick={() => setMobileMenu(true)} aria-label="Abrir menú"><Menu/></button>
        </div>
      </header>

      <main className="pb-28 lg:ml-64 lg:pb-8">
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8"><Outlet /></div>
      </main>

      <button onClick={() => setAddOpen(true)} className="fixed bottom-20 right-5 z-30 grid h-14 w-14 place-items-center rounded-full bg-slate-950 text-white shadow-2xl dark:bg-white dark:text-slate-950 sm:hidden" aria-label="Agregar movimiento"><Plus/></button>
      <MobileBottom />

      {mobileMenu && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-slate-950/45" onClick={() => setMobileMenu(false)} aria-label="Cerrar menú"/>
          <div className="absolute right-0 top-0 h-full w-[84%] max-w-sm bg-white p-5 shadow-2xl dark:bg-slate-950">
            <div className="flex items-center justify-between"><Brand/><button className="p-2" onClick={() => setMobileMenu(false)}><X/></button></div>
            <nav className="mt-7 space-y-1">{nav.map((item) => <DesktopLink key={item.to} {...item} onClick={() => setMobileMenu(false)} />)}</nav>
          </div>
        </div>
      )}
      <AddTransactionModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}

function Brand({ compact = false }: { compact?: boolean }) {
  return <div className="flex items-center gap-2"><div className="grid h-9 w-9 place-items-center rounded-2xl bg-slate-950 font-black text-white dark:bg-white dark:text-slate-950">F</div>{!compact && <div><div className="font-extrabold tracking-tight">FlowMoney</div><div className="text-[10px] font-semibold uppercase tracking-[.18em] text-slate-400">Personal finance</div></div>}</div>
}

function DesktopLink({ to, label, icon: Icon, onClick }: { to: string; label: string; icon: ElementType; onClick?: () => void }) {
  return <NavLink end={to === '/'} onClick={onClick} to={to} className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white'}`}><Icon size={18}/><span>{label}</span></NavLink>
}

function MobileBottom() {
  const items = nav.slice(0, 2).concat([{ to: '/movimientos', label: 'Movs.', icon: WalletCards }, { to: '/objetivos', label: 'Objetivos', icon: Goal }])
  return <nav className="fixed bottom-0 left-0 right-0 z-20 grid grid-cols-4 border-t border-slate-200 bg-white/95 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95 lg:hidden">{items.map((item) => <NavLink end={item.to === '/'} key={item.to} to={item.to} className={({isActive}) => `flex flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-semibold ${isActive ? 'text-slate-950 dark:text-white' : 'text-slate-400'}`}><item.icon size={20}/>{item.label}</NavLink>)}</nav>
}
