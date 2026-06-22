import { FunctionsHttpError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { AuthUserSummary } from '@/types/rota'

interface AdminFunctionResult<T> {
  data: T | null
  error: string | null
}

/** Extrai a mensagem de erro do corpo JSON retornado pela Edge Function. */
async function extractFnError(error: unknown): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    try {
      const body = await error.context.json()
      if (body?.error) return String(body.error)
    } catch {
      // corpo não-JSON: cai no fallback abaixo
    }
  }
  return error instanceof Error ? error.message : 'Erro inesperado.'
}

async function invokeAdminFn<T>(
  action: 'list' | 'create' | 'reset_password' | 'delete',
  payload?: Record<string, unknown>
): Promise<AdminFunctionResult<T>> {
  const { data, error } = await supabase.functions.invoke('admin-users', {
    body: { action, ...payload },
  })

  if (error) {
    return { data: null, error: await extractFnError(error) }
  }

  return { data: data as T, error: null }
}

export async function listUsers() {
  return invokeAdminFn<AuthUserSummary[]>('list')
}

export async function createUser(
  email: string,
  password: string,
  nomeCompleto: string,
  matricula: string,
  isAdmin = false
) {
  return invokeAdminFn<{ ok: true }>('create', {
    email,
    password,
    nomeCompleto,
    matricula,
    isAdmin,
  })
}

export async function resetUserPassword(userId: string, newPassword: string) {
  return invokeAdminFn<{ ok: true }>('reset_password', { userId, newPassword })
}

export async function deleteUser(userId: string) {
  return invokeAdminFn<{ ok: true }>('delete', { userId })
}
