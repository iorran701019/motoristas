import { supabase } from './supabase'

interface LogActionParams {
  /** Verbo do evento, ex.: 'motorista.created', 'rota.created', 'auth.login' */
  action: string
  /** Tipo da entidade afetada, ex.: 'motorista', 'rota', 'auth' */
  entity?: string
  /** Id do registro afetado (uuid ou outro), como texto */
  entityId?: string
  /** Payload livre para leitura humana no relatório de auditoria */
  details?: Record<string, unknown>
}

/**
 * Registra uma ação no audit log. Best-effort e à prova de falha:
 * NUNCA lança nem bloqueia a operação principal — no máximo console.error.
 *
 * Pega o autor da sessão atual via supabase.auth.getUser() porque este módulo
 * não é componente React (não pode usar useAuth). A policy RLS de audit_logs
 * exige actor_id = auth.uid(), por isso o actor_id precisa ser o usuário logado.
 * Sem usuário, retorna sem inserir.
 */
export async function logAction(params: LogActionParams): Promise<void> {
  try {
    const { data, error: userError } = await supabase.auth.getUser()
    const user = data?.user
    if (userError || !user) return

    const { error } = await supabase.from('audit_logs').insert({
      actor_id: user.id,
      actor_email: user.email ?? null,
      action: params.action,
      entity: params.entity ?? null,
      entity_id: params.entityId ?? null,
      details: params.details ?? null,
    })

    if (error) console.error('[audit] falha ao registrar ação:', params.action, error.message)
  } catch (err) {
    console.error('[audit] erro inesperado ao registrar ação:', params.action, err)
  }
}
