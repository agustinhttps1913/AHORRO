import { useRef, useState, type ChangeEvent } from 'react'
import { Database, Download, FileDown, FileUp, Moon, RotateCcw, Sun, Trash2 } from 'lucide-react'
import { Card, GhostButton, PageHeader, inputClass } from '../components/ui'
import { useFinance } from '../context/FinanceContext'
import type { FinanceState } from '../types/finance'

function isFinanceState(value: unknown): value is FinanceState {
  if (!value || typeof value !== 'object') return false
  const x = value as Partial<FinanceState>
  return Array.isArray(x.accounts) && Array.isArray(x.transactions) && Array.isArray(x.budgets) && Array.isArray(x.goals) && !!x.plan && !!x.settings
}

function downloadFile(name: string, content: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

function csvCell(value: string | number | boolean | undefined) {
  const text = String(value ?? '')
  return `"${text.replaceAll('"', '""')}"`
}

export function SettingsPage() {
  const state = useFinance()
  const { settings, updateSettings, importBackup, clearAll, loadDemo } = state
  const fileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState('')

  const exportData = () => {
    const payload: FinanceState = {
      accounts: state.accounts,
      transactions: state.transactions,
      budgets: state.budgets,
      goals: state.goals,
      plan: state.plan,
      settings: state.settings,
    }
    downloadFile(`flowmoney-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(payload, null, 2), 'application/json')
  }

  const exportCsv = () => {
    const header = ['fecha', 'tipo', 'monto', 'categoria', 'descripcion', 'cuenta', 'metodo_pago', 'recurrente']
    const rows = state.transactions.map((t) => {
      const account = state.accounts.find((a) => a.id === t.accountId)?.name ?? ''
      return [t.date, t.type, t.amount, t.category, t.description, account, t.paymentMethod ?? '', Boolean(t.recurring)].map(csvCell).join(',')
    })
    downloadFile(`flowmoney-movimientos-${new Date().toISOString().slice(0, 10)}.csv`, [header.join(','), ...rows].join('\n'), 'text/csv;charset=utf-8')
  }

  const importData = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const parsed: unknown = JSON.parse(await file.text())
      if (!isFinanceState(parsed)) throw new Error('Formato inválido')
      importBackup(parsed)
      setMessage('Backup importado correctamente.')
    } catch {
      setMessage('No pude importar ese archivo. Usá un backup JSON exportado por FlowMoney.')
    }
  }

  const erase = () => {
    if (!window.confirm('¿Borrar todos los datos guardados en este dispositivo? Esta acción no se puede deshacer sin un backup.')) return
    clearAll()
    setMessage('Datos eliminados. FlowMoney volvió a quedar vacío.')
  }

  const demo = () => {
    if (!window.confirm('Esto reemplaza tus datos actuales por datos de demostración. ¿Continuar?')) return
    loadDemo()
    setMessage('Datos demo cargados.')
  }

  return <>
    <PageHeader title="Configuración" subtitle="Personalizá FlowMoney y administrá tus copias de seguridad"/>
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <h2 className="font-bold">Perfil y formato</h2>
        <div className="mt-4 space-y-4">
          <label><span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Nombre</span><input className={inputClass} value={settings.name} onChange={e=>updateSettings({name:e.target.value})}/></label>
          <label><span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Moneda</span><select className={inputClass} value={settings.currency} onChange={e=>updateSettings({currency:e.target.value as typeof settings.currency})}><option>ARS</option><option>USD</option><option>EUR</option><option>BRL</option></select></label>
          <button onClick={()=>updateSettings({darkMode:!settings.darkMode})} className="flex w-full items-center justify-between rounded-2xl bg-slate-100 p-4 text-sm font-semibold dark:bg-slate-800"><span className="flex items-center gap-2">{settings.darkMode?<Moon size={18}/>:<Sun size={18}/>} Modo {settings.darkMode?'oscuro':'claro'}</span><span className="text-slate-400">Cambiar</span></button>
        </div>
      </Card>

      <Card>
        <h2 className="font-bold">Datos locales</h2>
        <div className="mt-4 space-y-2">
          <GhostButton className="w-full justify-start" onClick={exportData}><Download size={18}/> Exportar backup completo JSON</GhostButton>
          <GhostButton className="w-full justify-start" onClick={exportCsv}><FileDown size={18}/> Exportar movimientos CSV</GhostButton>
          <GhostButton className="w-full justify-start" onClick={() => fileRef.current?.click()}><FileUp size={18}/> Importar backup JSON</GhostButton>
          <input ref={fileRef} className="hidden" type="file" accept="application/json,.json" onChange={importData}/>
          <GhostButton className="w-full justify-start" onClick={demo}><RotateCcw size={18}/> Cargar datos de demostración</GhostButton>
          <GhostButton className="w-full justify-start text-rose-600 hover:text-rose-700 dark:text-rose-400" onClick={erase}><Trash2 size={18}/> Borrar todos mis datos</GhostButton>
        </div>
        <div className="mt-5 rounded-2xl bg-slate-100 p-4 text-xs leading-5 text-slate-500 dark:bg-slate-800">
          <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200"><Database size={16}/> Privacidad local</div>
          <p className="mt-1">Tus datos quedan guardados en este navegador mediante IndexedDB. GitHub Pages aloja la app, no tus movimientos financieros. Si borrás los datos del navegador o cambiás de dispositivo, usá un backup JSON para restaurarlos.</p>
        </div>
        {message && <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">{message}</p>}
      </Card>
    </div>
  </>
}
