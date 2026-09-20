import { PGlite } from '@electric-sql/pglite'
import { readFileSync } from 'node:fs'
import { beforeAll, afterAll, test, expect } from 'vitest'

const db = new PGlite()
const alice = '00000000-0000-4000-8000-000000000001'
const bob = '00000000-0000-4000-8000-000000000002'
const state = { accounts: [], transactions: [], budgets: [], goals: [], plan: {}, settings: {} }
async function asUser(id: string) {
  await db.exec('reset role')
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id])
  await db.exec('set role authenticated')
}
async function save(id: string, revision: number) {
  return db.query('select public.save_finance_document($1::jsonb, $2::bigint, $3::uuid) as revision', [JSON.stringify(state), revision, id])
}
beforeAll(async () => {
  await db.exec(`create role anon; create role authenticated;
    create schema auth; create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to authenticated;
    grant execute on function auth.uid() to authenticated;
    insert into auth.users values ('${alice}'), ('${bob}');`)
  await db.exec(readFileSync('supabase/schema.sql', 'utf8'))
}, 30000)
afterAll(async () => { await db.close() })

test('private accounts, atomic revision checks, and no anonymous access', async () => {
  await asUser(alice)
  expect((await save(alice, 0)).rows).toEqual([{ revision: 1 }])
  expect((await save(alice, 1)).rows).toEqual([{ revision: 2 }])
  await expect(save(alice, 1)).rejects.toThrow('FINANCE_CONFLICT')
  await expect(save(alice, 0)).rejects.toThrow('FINANCE_CONFLICT')
  await expect(save(bob, 0)).rejects.toThrow('Authentication required')
  await asUser(bob)
  expect((await db.query('select * from public.finance_documents')).rows).toHaveLength(0)
  expect((await save(bob, 0)).rows).toEqual([{ revision: 1 }])
  expect((await db.query('select user_id from public.finance_documents')).rows).toEqual([{ user_id: bob }])
  expect((await db.query('update public.finance_documents set revision=99 where user_id=$1 returning user_id', [alice])).rows).toHaveLength(0)
  await expect(db.query('update public.finance_documents set user_id=$1 where user_id=$2', [alice, bob])).rejects.toThrow()
  await db.exec('reset role; set role anon;')
  await expect(db.query('select * from public.finance_documents')).rejects.toThrow('permission denied')
  await expect(save(bob, 1)).rejects.toThrow('permission denied')
})
