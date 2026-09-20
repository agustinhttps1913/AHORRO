import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, startOfMonth, startOfWeek, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { AddTransactionModal } from '../components/AddTransactionModal'
import { Card, PageHeader } from '../components/ui'
import { useFinance } from '../context/FinanceContext'
import { compactMoney } from '../utils/money'

export function CalendarPage() {
  const { transactions, settings } = useFinance()
  const [month, setMonth] = useState(new Date())
  const [selected, setSelected] = useState<string | undefined>()
  const [open, setOpen] = useState(false)
  const days = useMemo(() => eachDayOfInterval({ start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }), end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }) }), [month])
  const byDate = useMemo(() => new Map(days.map((d) => { const key = format(d, 'yyyy-MM-dd'); return [key, transactions.filter((t) => t.date === key)] })), [days, transactions])

  return <>
    <PageHeader title="Calendario financiero" subtitle="Visualizá qué entra y qué sale cada día" />
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800"><button onClick={() => setMonth(subMonths(month,1))} className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800"><ChevronLeft/></button><h2 className="font-bold capitalize">{format(month, 'MMMM yyyy', { locale: es })}</h2><button onClick={() => setMonth(addMonths(month,1))} className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800"><ChevronRight/></button></div>
      <div className="grid grid-cols-7 border-b border-slate-100 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800">{['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map((d) => <div className="py-3" key={d}>{d}</div>)}</div>
      <div className="grid grid-cols-7">{days.map((d) => { const key = format(d,'yyyy-MM-dd'); const items = byDate.get(key) ?? []; return <button key={key} onClick={() => {setSelected(key); setOpen(true)}} className={`min-h-24 border-b border-r border-slate-100 p-2 text-left align-top transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 sm:min-h-32 ${!isSameMonth(d, month) ? 'opacity-35' : ''}`}><div className="mb-1 text-xs font-semibold">{format(d,'d')}</div><div className="space-y-1">{items.slice(0,3).map((t) => <div key={t.id} className={`truncate rounded-lg px-1.5 py-1 text-[10px] font-semibold ${t.type === 'income' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : t.type === 'saving' ? 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'}`}>{t.type === 'income' ? '+' : '-'} {compactMoney(t.amount, settings.currency)} {t.description}</div>)}{items.length > 3 && <div className="text-[10px] text-slate-400">+{items.length-3} más</div>}</div></button>})}</div>
    </Card>
    <button onClick={() => { setSelected(format(new Date(),'yyyy-MM-dd')); setOpen(true)}} className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-slate-950"><Plus size={18}/> Agregar al calendario</button>
    <AddTransactionModal key={selected ?? 'today'} open={open} onClose={() => setOpen(false)} initialDate={selected}/>
  </>
}
