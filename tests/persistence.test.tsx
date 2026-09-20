// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { FinanceProvider, useFinance, emptyState } from '../src/context/FinanceContext'

const api = vi.hoisted(() => ({ load: vi.fn(), rpc: vi.fn(), session: vi.fn() }))
vi.mock('../src/lib/supabase', () => ({ supabase: {
  from: () => ({ select: () => ({ eq: () => ({ maybeSingle: api.load }) }) }),
  rpc: api.rpc,
  auth: { getSession: api.session },
} }))
function Probe() {
  const data = useFinance()
  return <><span>{data.dataLoading ? 'loading' : data.settings.name}</span><span>{data.syncStatus}</span>
    <button onClick={() => data.updateSettings({ name: 'Changed' })}>edit</button>
    <button onClick={() => data.updateSettings({ name: 'Newest' })}>edit again</button></>
}
beforeEach(() => {
  vi.clearAllMocks(); localStorage.clear()
  api.load.mockResolvedValue({ data: { state: emptyState, revision: 4 }, error: null })
  api.session.mockResolvedValue({ data: { session: { user: { id: 'alice' } } }, error: null })
  api.rpc.mockResolvedValue({ data: 5, error: null })
})
afterEach(cleanup)

test('loading does not overwrite data, and edits carry user identity and revision', async () => {
  render(<FinanceProvider userId="alice"><Probe /></FinanceProvider>)
  await screen.findByText('Mi cuenta')
  expect(api.rpc).not.toHaveBeenCalled()
  fireEvent.click(screen.getByText('edit'))
  await waitFor(() => expect(api.rpc).toHaveBeenCalledWith('save_finance_document', expect.objectContaining({ p_revision: 4, p_user_id: 'alice' })))
  await screen.findByText('Guardado en la nube')
  expect(localStorage.getItem('ahorro-pending-alice')).toBeNull()
})

test('failed initial read never saves an empty account', async () => {
  api.load.mockResolvedValue({ data: null, error: new Error('offline') })
  render(<FinanceProvider userId="alice"><Probe /></FinanceProvider>)
  await screen.findByText(/No se pudieron cargar/)
  expect(api.rpc).not.toHaveBeenCalled()
})

test('failed save preserves changes and never reports success', async () => {
  api.rpc.mockResolvedValue({ data: null, error: new Error('offline') })
  render(<FinanceProvider userId="alice"><Probe /></FinanceProvider>)
  await screen.findByText('Mi cuenta')
  fireEvent.click(screen.getByText('edit'))
  await screen.findByText(/No se pudieron guardar/)
  expect(JSON.parse(localStorage.getItem('ahorro-pending-alice')!).settings.name).toBe('Changed')
  expect(screen.queryByText('Guardado en la nube')).toBeNull()
})

test('a switched session cannot write the previous users data', async () => {
  api.session.mockResolvedValue({ data: { session: { user: { id: 'bob' } } }, error: null })
  render(<FinanceProvider userId="alice"><Probe /></FinanceProvider>)
  await screen.findByText('Mi cuenta')
  fireEvent.click(screen.getByText('edit'))
  await screen.findByText(/No se pudieron guardar/)
  expect(api.rpc).not.toHaveBeenCalled()
})

test('rapid edits serialize with the revision returned by the previous save', async () => {
  let finish!: (value: unknown) => void
  api.rpc.mockImplementationOnce(() => new Promise(resolve => { finish = resolve }))
    .mockResolvedValueOnce({ data: 6, error: null })
  render(<FinanceProvider userId="alice"><Probe /></FinanceProvider>)
  await screen.findByText('Mi cuenta')
  fireEvent.click(screen.getByText('edit'))
  await waitFor(() => expect(api.rpc).toHaveBeenCalledTimes(1))
  fireEvent.click(screen.getByText('edit again'))
  expect(api.rpc).toHaveBeenCalledTimes(1)
  finish({ data: 5, error: null })
  await screen.findByText('Guardado en la nube')
  expect(api.rpc).toHaveBeenNthCalledWith(2, 'save_finance_document', expect.objectContaining({ p_revision: 5, p_state: expect.objectContaining({ settings: expect.objectContaining({ name: 'Newest' }) }) }))
})
