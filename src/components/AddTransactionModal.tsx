import { useMemo, useState, type FormEvent } from 'react'
import { Modal } from './Modal'
import { Button, inputClass } from './ui'
import { useFinance } from '../context/FinanceContext'
import type { TransactionType } from '../types/finance'

const expenseCategories = ['Vivienda','Supermercado','Comida','Transporte','Salud','Educación','Gimnasio','Servicios','Entretenimiento','Ropa','Tecnología','Suscripciones','Impuestos','Viajes','Mascotas','Regalos','Otros']
const incomeCategories = ['Sueldo','Ventas','Freelance','Inversiones','Devolución','Otros']

export function AddTransactionModal({ open, onClose, initialDate }: { open: boolean; onClose: () => void; initialDate?: string }) {
  const { accounts, addTransaction } = useFinance()
  const [type, setType] = useState<TransactionType>('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Supermercado')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(initialDate ?? new Date().toISOString().slice(0, 10))
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? '')
  const [recurring, setRecurring] = useState(false)
  const categories = useMemo(() => type === 'income' ? incomeCategories : expenseCategories, [type])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const value = Number(amount)
    if (!value || value <= 0 || !accountId) return
    addTransaction({ type, amount: value, category, description: description || category, date, accountId, recurring })
    setAmount(''); setDescription(''); onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Nuevo movimiento">
      <form className="space-y-4" onSubmit={submit}>
        <div className="grid grid-cols-3 gap-2">
          {(['expense','income','saving'] as TransactionType[]).map((item) => (
            <button key={item} type="button" onClick={() => { setType(item); setCategory(item === 'income' ? 'Sueldo' : item === 'saving' ? 'Ahorro' : 'Supermercado') }} className={`rounded-2xl px-3 py-2.5 text-sm font-semibold ${type === item ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
              {item === 'expense' ? 'Gasto' : item === 'income' ? 'Ingreso' : 'Ahorro'}
            </button>
          ))}
        </div>
        <label className="block"><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Monto</span><input autoFocus inputMode="decimal" className={`${inputClass} text-xl font-bold`} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" /></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Categoría</span><select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)}>{categories.map((c) => <option key={c}>{c}</option>)}</select></label>
          <label><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Cuenta</span><select className={inputClass} value={accountId} onChange={(e) => setAccountId(e.target.value)}>{accounts.map((a) => <option value={a.id} key={a.id}>{a.name}</option>)}</select></label>
        </div>
        <label className="block"><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Fecha</span><input type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} /></label>
        <label className="block"><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Descripción (opcional)</span><input className={inputClass} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ej. compra semanal" /></label>
        {type === 'expense' && <label className="flex items-center gap-3 rounded-2xl bg-slate-100 p-3 text-sm font-medium dark:bg-slate-800"><input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)}/> Marcar como gasto recurrente</label>}
        <Button className="w-full" type="submit">Guardar movimiento</Button>
      </form>
    </Modal>
  )
}
