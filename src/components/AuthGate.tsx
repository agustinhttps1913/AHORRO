import { useEffect, useState, type ReactNode, type FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { Button, inputClass } from './ui'

export function AuthGate({ children }: { children: (userId: string) => ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [signup, setSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    let active = true
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      if (active) { setSession(next); setLoading(false) }
    })
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return
      if (error) setMessage('No se pudo recuperar la sesión. Volvé a ingresar.')
      setSession(data.session); setLoading(false)
    }).catch(() => { if (active) { setMessage('No se pudo conectar. Recargá la página.'); setLoading(false) } })
    return () => { active = false; data.subscription.unsubscribe() }
  }, [])

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!supabase) return
    setBusy(true); setMessage('')
    try {
      const credentials = { email: email.trim(), password }
      const result = signup
        ? await supabase.auth.signUp({ ...credentials, options: { emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}` } })
        : await supabase.auth.signInWithPassword(credentials)
      if (result.error) throw result.error
      setPassword('')
      if (signup && !result.data.session) setMessage('Revisá tu correo para confirmar la cuenta. Después volvé e iniciá sesión.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo ingresar. Intentá de nuevo.')
    } finally { setBusy(false) }
  }

  if (loading) return <div className="p-8 text-center">Conectando con tu cuenta…</div>
  if (session) return <>{children(session.user.id)}</>
  return <main className="grid min-h-screen place-items-center bg-slate-100 p-5">
    <section className="w-full max-w-sm rounded-3xl bg-white p-7 shadow-lg">
      <h1 className="text-2xl font-bold">AHORRO</h1>
      {!supabase ? <p className="mt-4">La conexión a la nube todavía no está configurada. Tus datos anteriores siguen en este navegador.</p> : <>
        <p className="my-4 text-sm text-slate-600">Tus gastos, ahorros y objetivos, en tu cuenta privada.</p>
        <form onSubmit={submit} className="space-y-4">
          <label className="block">Correo<input required type="email" autoComplete="email" className={inputClass} value={email} onChange={e => setEmail(e.target.value)}/></label>
          <label className="block">Contraseña<input required type="password" minLength={signup ? 8 : 1} autoComplete={signup ? 'new-password' : 'current-password'} className={inputClass} value={password} onChange={e => setPassword(e.target.value)}/></label>
          <Button className="w-full" disabled={busy}>{busy ? 'Conectando…' : signup ? 'Crear mi cuenta' : 'Ingresar'}</Button>
        </form>
        <button className="mt-4 text-sm underline" disabled={busy} onClick={() => { setSignup(!signup); setMessage('') }}>{signup ? 'Ya tengo cuenta' : 'Crear una cuenta'}</button>
      </>}
      {message && <p role="status" className="mt-4 text-sm text-slate-700">{message}</p>}
    </section>
  </main>
}
