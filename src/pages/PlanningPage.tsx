import { useState } from 'react'
import { Card, Button, PageHeader, inputClass, Progress } from '../components/ui'
import { useFinance } from '../context/FinanceContext'
import { money } from '../utils/money'

export function PlanningPage() {
  const { plan, updatePlan, settings } = useFinance()
  const [draft, setDraft] = useState(plan)
  const free = draft.expectedIncome - draft.fixedExpenses - draft.variableExpenses - draft.savingsTarget
  const used = draft.expectedIncome > 0 ? ((draft.fixedExpenses + draft.variableExpenses + draft.savingsTarget) / draft.expectedIncome) * 100 : 0
  const field = (label: string, key: keyof typeof draft) => <label><span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">{label}</span><input className={inputClass} type="number" min="0" value={draft[key]} onChange={(e) => setDraft({ ...draft, [key]: Number(e.target.value) })}/></label>
  return <>
    <PageHeader title="Planificación del mes" subtitle="Respondé una sola pregunta: ¿cuánto podés gastar sin complicarte?" />
    <div className="grid gap-4 xl:grid-cols-[.8fr_1.2fr]">
      <Card><h2 className="font-bold">Tu plan</h2><div className="mt-5 grid gap-4">{field('Ingresos esperados','expectedIncome')}{field('Gastos fijos','fixedExpenses')}{field('Gastos variables previstos','variableExpenses')}{field('Ahorro objetivo','savingsTarget')}<Button onClick={() => updatePlan(draft)}>Guardar planificación</Button></div></Card>
      <Card className="flex flex-col justify-between"><div><p className="text-sm font-semibold text-slate-500">Dinero libre estimado</p><div className={`mt-2 text-4xl font-black tracking-tight ${free < 0 ? 'text-rose-600' : ''}`}>{money(free, settings.currency)}</div><p className="mt-2 text-sm text-slate-500">Después de cubrir gastos fijos, variables y tu ahorro objetivo.</p><div className="mt-7"><div className="mb-2 flex justify-between text-sm"><span>Ingresos comprometidos</span><strong>{Math.round(used)}%</strong></div><Progress value={used}/></div></div><div className="mt-8 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-800"><div className="text-xs font-semibold uppercase text-slate-500">Disponible por semana</div><div className="mt-1 text-xl font-black">{money(Math.max(0,free)/4.33, settings.currency)}</div></div><div className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-800"><div className="text-xs font-semibold uppercase text-slate-500">Disponible por día</div><div className="mt-1 text-xl font-black">{money(Math.max(0,free)/30, settings.currency)}</div></div></div></Card>
    </div>
  </>
}
