import { useMemo, useState, type FormEvent } from 'react'
import { Plus } from 'lucide-react'
import { Card, Button, PageHeader, Progress, inputClass } from '../components/ui'
import { useFinance } from '../context/FinanceContext'
import { currentMonthTransactions } from '../utils/stats'
import { money } from '../utils/money'

export function BudgetsPage() {
  const { budgets, transactions, setBudget, settings } = useFinance()
  const [category, setCategory] = useState('')
  const [limit, setLimit] = useState('')
  const spent = useMemo(() => { const m = new Map<string,number>(); currentMonthTransactions(transactions).filter((t) => t.type === 'expense').forEach((t) => m.set(t.category, (m.get(t.category) ?? 0) + t.amount)); return m }, [transactions])
  const submit = (e: FormEvent) => { e.preventDefault(); if (!category || !Number(limit)) return; setBudget(category, Number(limit)); setCategory(''); setLimit('') }
  return <>
    <PageHeader title="Presupuestos" subtitle="Definí límites claros antes de gastar" />
    <div className="grid gap-4 xl:grid-cols-[1fr_.55fr]">
      <div className="grid gap-4 sm:grid-cols-2">{budgets.map((b) => { const used = spent.get(b.category) ?? 0; const p = b.limit ? used/b.limit*100 : 0; return <Card key={b.id}><div className="flex items-start justify-between"><div><h3 className="font-bold">{b.category}</h3><p className="mt-1 text-sm text-slate-500">{money(used, settings.currency)} de {money(b.limit, settings.currency)}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${p >= 100 ? 'bg-rose-100 text-rose-700' : p >= 80 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{p >= 100 ? 'Excedido' : p >= 80 ? 'Cerca del límite' : 'Bajo control'}</span></div><div className="mt-5"><Progress value={p}/></div><div className="mt-3 flex justify-between text-xs text-slate-500"><span>{Math.round(p)}% usado</span><span>{money(Math.max(0,b.limit-used), settings.currency)} disponible</span></div></Card>})}</div>
      <Card className="h-fit"><div className="flex items-center gap-2"><Plus size={18}/><h2 className="font-bold">Crear o actualizar</h2></div><form onSubmit={submit} className="mt-4 space-y-3"><input className={inputClass} placeholder="Categoría" value={category} onChange={(e) => setCategory(e.target.value)}/><input className={inputClass} type="number" min="0" placeholder="Límite mensual" value={limit} onChange={(e) => setLimit(e.target.value)}/><Button className="w-full">Guardar presupuesto</Button></form></Card>
    </div>
  </>
}
