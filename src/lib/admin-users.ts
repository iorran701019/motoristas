import { supabase } from '@/lib/supabase'
import type { AuthUserSummary } from '@/types/rota'

interface AdminFunctionResult<T> {
  data: T | null
  error: string | null
}

async function invokeAdminFn<T>(
  action: 'list' | 'create' | 'reset_password',
  payload?: Record<string, unknown>
): Promise<AdminFunctionResult<T>> {
  const { data, error } = await supabase.functions.invoke('admin-users', {
    body: { action, ...payload },
  })

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: data as T, error: null }
}

export async function listUsers() {
  return invokeAdminFn<AuthUserSummary[]>('list')
}

export async function createUser(email: string, password: string, isAdmin = false) {
  return invokeAdminFn<{ ok: true }>('create', { email, password, isAdmin })
}

export async function resetUserPassword(userId: string, newPassword: string) {
  return invokeAdminFn<{ ok: true }>('reset_password', { userId, newPassword })
}
