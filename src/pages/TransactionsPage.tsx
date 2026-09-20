import { useMemo, useState } from 'react'
import { Plus, Search, Trash2 } from 'lucide-react'
import { AddTransactionModal } from '../components/AddTransactionModal'
import { Card, GhostButton, PageHeader, inputClass } from '../components/ui'
import { useFinance } from '../context/FinanceContext'
import { money } from '../utils/money'

export function TransactionsPage() {
  const { transactions, accounts, settings, deleteTransaction } = useFinance()
  const [query, setQuery] = useState('')
  const [type, setType] = useState('all')
  const [open, setOpen] = useState(false)
  const filtered = useMemo(() => transactions.filter((t) => {
    const haystack = `${t.description} ${t.category} ${t.amount}`.toLowerCase()
    return haystack.includes(query.toLowerCase()) && (type === 'all' || t.type === type)
  }).sort((a,b) => b.date.localeCompare(a.date)), [transactions, query, type])

  return <>
    <PageHeader title="Movimientos" subtitle="Todo lo que entra, sale o se separa" action={<button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-slate-950"><Plus size={18}/> Agregar</button>}/>
    <Card>
      <div className="grid gap-3 md:grid-cols-[1fr_180px]"><label className="relative"><Search className="absolute left-3 top-3.5 text-slate-400" size={17}/><input className={`${inputClass} pl-10`} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por comercio, categoría o monto"/></label><select className={inputClass} value={type} onChange={(e) => setType(e.target.value)}><option value="all">Todos</option><option value="expense">Gastos</option><option value="income">Ingresos</option><option value="saving">Ahorros</option></select></div>
      <div className="mt-5 divide-y divide-slate-100 dark:divide-slate-800">{filtered.length === 0 ? <div className="py-12 text-center text-sm text-slate-500">No hay movimientos para esos filtros.</div> : filtered.map((t) => { const account = accounts.find((a) => a.id === t.accountId); return <div key={t.id} className="flex items-center gap-3 py-3.5"><div className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl font-bold ${t.type === 'income' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950' : t.type === 'saving' ? 'bg-sky-50 text-sky-600 dark:bg-sky-950' : 'bg-rose-50 text-rose-600 dark:bg-rose-950'}`}>{t.type === 'income' ? '+' : t.type === 'saving' ? 'S' : '−'}</div><div className="min-w-0 flex-1"><div className="truncate font-semibold">{t.description}</div><div className="text-xs text-slate-500">{t.category} · {account?.name ?? 'Sin cuenta'} · {new Intl.DateTimeFormat('es-AR').format(new Date(`${t.date}T12:00:00`))}</div></div><div className={`text-right font-bold ${t.type === 'income' ? 'text-emerald-600' : ''}`}>{t.type === 'income' ? '+' : '-'}{money(t.amount, settings.currency)}</div><GhostButton aria-label="Eliminar" onClick={() => deleteTransaction(t.id)}><Trash2 size={17}/></GhostButton></div>})}</div>
    </Card>
    <AddTransactionModal open={open} onClose={() => setOpen(false)}/>
  </>
}
