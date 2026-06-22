import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { logAction } from '@/lib/audit'
import { getSupabaseConfig } from '@/lib/supabase-config'
import type { Setor, SetorInsert } from '@/types/rota'

interface UseSetoresReturn {
  setores: Setor[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createSetor: (data: SetorInsert) => Promise<{ error: string | null }>
  updateSetor: (id: string, data: SetorInsert) => Promise<{ error: string | null }>
  deleteSetor: (id: string) => Promise<{ error: string | null }>
}

/**
 * Hook de gestão dos setores da SME (tabela setores_sme).
 * RLS: leitura para qualquer autenticado; escrita só admin (migration 013).
 */
export function useSetores(): UseSetoresReturn {
  const { session } = useAuth()
  const userId = session?.user?.id
  const [setores, setSetores] = useState<Setor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSetores = useCallback(async () => {
    setLoading(true)
    setError(null)

    if (!getSupabaseConfig().isConfigured) {
      setSetores([])
      setLoading(false)
      return
    }

    const { data, error: fetchError } = await supabase
      .from('setores_sme')
      .select('*')
      .order('nome', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
      setSetores([])
    } else {
      setSetores((data as Setor[]) ?? [])
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    // Só busca quando há sessão autenticada — evita o fetch anon (0 linhas) do
    // boot e refaz ao logar/trocar de conta na mesma aba.
    if (userId) fetchSetores()
  }, [userId, fetchSetores])

  const createSetor = async (payload: SetorInsert) => {
    const { data, error: insertError } = await supabase
      .from('setores_sme')
      .insert(payload)
      .select('id')
      .single()
    if (insertError) return { error: insertError.message }
    void logAction({
      action: 'setor.created',
      entity: 'setor',
      entityId: data?.id,
      details: { nome: payload.nome, cor: payload.cor },
    })
    await fetchSetores()
    return { error: null }
  }

  const updateSetor = async (id: string, payload: SetorInsert) => {
    // Altera APENAS setores_sme. A cor mora só aqui; o calendário lê via setor_id,
    // então mudar a cor reflete em todas as rotas vinculadas sem cópia.
    const { error: updateError } = await supabase
      .from('setores_sme')
      .update(payload)
      .eq('id', id)
    if (updateError) return { error: updateError.message }
    void logAction({
      action: 'setor.updated',
      entity: 'setor',
      entityId: id,
      details: { nome: payload.nome, cor: payload.cor },
    })
    await fetchSetores()
    return { error: null }
  }

  const deleteSetor = async (id: string) => {
    const { error: deleteError } = await supabase.from('setores_sme').delete().eq('id', id)
    if (deleteError) {
      // FK ON DELETE RESTRICT: setor com rotas vinculadas (Postgres 23503)
      if (deleteError.code === '23503') {
        return { error: 'Não é possível excluir: há rotas vinculadas a este setor.' }
      }
      return { error: deleteError.message }
    }
    await fetchSetores()
    return { error: null }
  }

  return {
    setores,
    loading,
    error,
    refetch: fetchSetores,
    createSetor,
    updateSetor,
    deleteSetor,
  }
}
