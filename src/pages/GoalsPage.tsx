import { useState, type FormEvent } from 'react'
import { Plus } from 'lucide-react'
import { Button, Card, PageHeader, Progress, inputClass } from '../components/ui'
import { useFinance } from '../context/FinanceContext'
import { money } from '../utils/money'

export function GoalsPage() {
  const { goals, addGoal, contributeToGoal, settings } = useFinance()
  const [name,setName]=useState(''); const [target,setTarget]=useState(''); const [date,setDate]=useState('2027-03-01')
  const submit=(e:FormEvent)=>{e.preventDefault(); if(!name||!Number(target))return; addGoal({name,target:Number(target),saved:0,targetDate:date,priority:'medium'});setName('');setTarget('')}
  return <>
    <PageHeader title="Objetivos" subtitle="Convertí metas grandes en avances concretos" />
    <div className="grid gap-4 lg:grid-cols-2">{goals.map((g)=>{const p=g.target?g.saved/g.target*100:0;const remaining=Math.max(0,g.target-g.saved); const months=Math.max(1,Math.ceil((new Date(g.targetDate).getTime()-Date.now())/(1000*60*60*24*30.4))); return <Card key={g.id}><div className="flex items-start justify-between"><div><h3 className="text-lg font-bold">{g.name}</h3><p className="text-sm text-slate-500">Objetivo: {new Intl.DateTimeFormat('es-AR',{month:'long',year:'numeric'}).format(new Date(`${g.targetDate}T12:00:00`))}</p></div><div className="text-2xl font-black">{Math.round(p)}%</div></div><div className="mt-5"><Progress value={p}/></div><div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-slate-100 p-3 dark:bg-slate-800"><div className="text-xs text-slate-500">Acumulado</div><div className="font-bold">{money(g.saved,settings.currency)}</div></div><div className="rounded-2xl bg-slate-100 p-3 dark:bg-slate-800"><div className="text-xs text-slate-500">Falta</div><div className="font-bold">{money(remaining,settings.currency)}</div></div></div><p className="mt-4 text-sm text-slate-500">Para llegar a tiempo: aprox. <strong className="text-slate-900 dark:text-white">{money(remaining/months,settings.currency)}/mes</strong></p><div className="mt-4 flex gap-2"><button className="rounded-xl bg-slate-950 px-3 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-950" onClick={()=>contributeToGoal(g.id,10000)}>+ {money(10000,settings.currency)}</button><button className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold dark:bg-slate-800" onClick={()=>contributeToGoal(g.id,50000)}>+ {money(50000,settings.currency)}</button></div></Card>})}</div>
    <Card className="mt-4"><div className="flex items-center gap-2"><Plus size={18}/><h2 className="font-bold">Nuevo objetivo</h2></div><form onSubmit={submit} className="mt-4 grid gap-3 md:grid-cols-[1fr_180px_180px_auto]"><input className={inputClass} placeholder="Ej. Fondo de emergencia" value={name} onChange={(e)=>setName(e.target.value)}/><input className={inputClass} type="number" min="0" placeholder="Monto" value={target} onChange={(e)=>setTarget(e.target.value)}/><input className={inputClass} type="date" value={date} onChange={(e)=>setDate(e.target.value)}/><Button>Crear</Button></form></Card>
  </>
}
