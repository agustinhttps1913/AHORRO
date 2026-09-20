import type { ElementType } from 'react'
import { ArrowDownRight, ArrowUpRight, CalendarClock, PiggyBank, Wallet } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts'
import { Card, PageHeader, Progress } from '../components/ui'
import { useFinance } from '../context/FinanceContext'
import { categoryTotals, financeStats } from '../utils/stats'
import { money } from '../utils/money'

const palette = ['#0f172a','#334155','#64748b','#94a3b8','#cbd5e1','#10b981','#f59e0b','#ef4444']

export function DashboardPage() {
  const state = useFinance()
  const stats = financeStats(state)
  const categories = categoryTotals(state.transactions)
  const monthLabel = new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(new Date())
  const flow = [...stats.month].sort((a,b) => a.date.localeCompare(b.date)).map((t) => ({
    date: new Intl.DateTimeFormat('es-AR', { day: '2-digit' }).format(new Date(`${t.date}T12:00:00`)),
    ingresos: t.type === 'income' ? t.amount : 0,
    gastos: t.type === 'expense' ? t.amount : 0,
  }))
  const topUpcoming = [...state.transactions].filter((t) => t.type === 'expense').sort((a,b) => a.date.localeCompare(b.date)).slice(0,4)
  const health = Math.max(0, Math.min(100, Math.round(65 + stats.savingsRate - (stats.expenses > stats.income ? 20 : 0))))

  return <>
    <PageHeader title="Tu panorama financiero" subtitle={`Resumen de ${monthLabel}`} />
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Metric label="Saldo total" value={money(stats.balance, state.settings.currency)} icon={Wallet} />
      <Metric label="Ingresos del mes" value={money(stats.income, state.settings.currency)} icon={ArrowUpRight} hint="Entradas registradas" />
      <Metric label="Gastos del mes" value={money(stats.expenses, state.settings.currency)} icon={ArrowDownRight} hint="Salidas registradas" />
      <Metric label="Ahorro del mes" value={money(stats.savings, state.settings.currency)} icon={PiggyBank} hint={`${Math.round(stats.savingsRate)}% de tus ingresos`} />
    </div>

    <div className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_.65fr]">
      <Card className="min-h-[360px]">
        <div className="mb-5 flex items-center justify-between"><div><h2 className="font-bold">Flujo de dinero</h2><p className="text-sm text-slate-500">Ingresos vs. gastos del mes</p></div></div>
        <div className="h-[280px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={flow}><defs><linearGradient id="income" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient><linearGradient id="expense" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.25}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/><XAxis dataKey="date" tickLine={false} axisLine={false}/><YAxis hide/><Tooltip formatter={(v) => money(Number(v), state.settings.currency)}/><Area type="monotone" dataKey="ingresos" stroke="#10b981" fill="url(#income)" strokeWidth={2.5}/><Area type="monotone" dataKey="gastos" stroke="#ef4444" fill="url(#expense)" strokeWidth={2.5}/></AreaChart></ResponsiveContainer></div>
      </Card>

      <Card>
        <h2 className="font-bold">Gastos por categoría</h2><p className="text-sm text-slate-500">Dónde se está yendo tu dinero</p>
        <div className="mt-2 h-52"><ResponsiveContainer><PieChart><Pie data={categories} dataKey="value" nameKey="name" innerRadius={52} outerRadius={80} paddingAngle={3}>{categories.map((_, i) => <Cell key={i} fill={palette[i % palette.length]}/>)}</Pie><Tooltip formatter={(v) => money(Number(v), state.settings.currency)}/></PieChart></ResponsiveContainer></div>
        <div className="space-y-2">{categories.slice(0,4).map((c, i) => <div key={c.name} className="flex items-center justify-between text-sm"><div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{background: palette[i % palette.length]}}/><span className="text-slate-600 dark:text-slate-300">{c.name}</span></div><span className="font-semibold">{money(c.value, state.settings.currency)}</span></div>)}</div>
      </Card>
    </div>

    <div className="mt-4 grid gap-4 lg:grid-cols-3">
      <Card>
        <div className="flex items-start justify-between"><div><h2 className="font-bold">Salud financiera</h2><p className="text-sm text-slate-500">Indicador orientativo</p></div><div className="text-right"><div className="text-3xl font-black">{health}</div><div className="text-xs text-slate-500">/ 100</div></div></div>
        <div className="mt-5"><Progress value={health}/></div><p className="mt-4 text-sm text-slate-600 dark:text-slate-300">{health >= 80 ? 'Muy buena. Mantenés un buen equilibrio entre ingresos, gastos y ahorro.' : health >= 60 ? 'Buena, con margen para mejorar tu tasa de ahorro.' : 'Revisá gastos y presupuesto para recuperar margen.'}</p>
      </Card>
      <Card>
        <div className="flex items-center gap-2"><CalendarClock size={18}/><h2 className="font-bold">Próximos movimientos</h2></div><div className="mt-4 space-y-3">{topUpcoming.map((t) => <div key={t.id} className="flex items-center justify-between"><div><div className="font-semibold">{t.description}</div><div className="text-xs text-slate-500">{new Intl.DateTimeFormat('es-AR').format(new Date(`${t.date}T12:00:00`))}</div></div><div className="font-semibold">-{money(t.amount, state.settings.currency)}</div></div>)}</div>
      </Card>
      <Card>
        <h2 className="font-bold">Objetivos</h2><div className="mt-4 space-y-5">{state.goals.slice(0,3).map((g) => { const p = g.target ? g.saved/g.target*100 : 0; return <div key={g.id}><div className="mb-2 flex justify-between"><div><div className="font-semibold">{g.name}</div><div className="text-xs text-slate-500">{money(g.saved, state.settings.currency)} / {money(g.target, state.settings.currency)}</div></div><span className="text-sm font-bold">{Math.round(p)}%</span></div><Progress value={p}/></div>})}</div>
      </Card>
    </div>
  </>
}

function Metric({ label, value, hint, icon: Icon }: { label: string; value: string; hint?: string; icon: ElementType }) {
  return <Card><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-2xl font-black tracking-tight">{value}</p>{hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}</div><div className="rounded-2xl bg-slate-100 p-2.5 dark:bg-slate-800"><Icon size={19}/></div></div></Card>
}
