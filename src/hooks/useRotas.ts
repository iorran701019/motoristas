import { useCallback, useEffect, useState } from 'react'
import { supabase, TABLE_ROTAS } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { logAction } from '@/lib/audit'
import { getSupabaseConfig } from '@/lib/supabase-config'
import { todayISO } from '@/lib/utils'
import type {
  DashboardStats,
  RotaMotorista,
  RotaMotoristaInsert,
  RotaStatus,
} from '@/types/rota'

interface UseRotasReturn {
  rotas: RotaMotorista[]
  stats: DashboardStats
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createRota: (data: RotaMotoristaInsert) => Promise<{ error: string | null }>
  updateRota: (id: string, data: RotaMotoristaInsert) => Promise<{ error: string | null }>
  updateRotaStatus: (id: string, status: RotaStatus) => Promise<{ error: string | null }>
  deleteRota: (id: string) => Promise<{ error: string | null }>
}

/** Calcula estatísticas do dashboard a partir da lista de rotas */
function computeStats(rotas: RotaMotorista[]): DashboardStats {
  const hoje = todayISO()
  const motoristas = new Set(rotas.map((r) => r.motorista.trim().toLowerCase()))

  return {
    totalRotas: rotas.length,
    totalMotoristas: motoristas.size,
    rotasHoje: rotas.filter((r) => r.data === hoje).length,
    totalPassageiros: rotas.reduce((sum, r) => sum + (r.qtd_passageiros ?? 0), 0),
  }
}

/**
 * Hook central de dados das rotas.
 * Centraliza fetch e criação para reutilização entre páginas.
 */
export function useRotas(): UseRotasReturn {
  const { session } = useAuth()
  const userId = session?.user?.id
  const [rotas, setRotas] = useState<RotaMotorista[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRotas = useCallback(async () => {
    setLoading(true)
    setError(null)

    const config = getSupabaseConfig()
    if (!config.isConfigured) {
      setError(
        'Configure o arquivo .env com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY, depois reinicie npm run dev'
      )
      setRotas([])
      setLoading(false)
      return
    }

    const { data, error: fetchError } = await supabase
      .from(TABLE_ROTAS)
      .select('*')
      .order('data', { ascending: false })
      .order('horario_saida', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
      setRotas([])
    } else {
      setRotas((data as RotaMotorista[]) ?? [])
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    // Só busca quando há sessão autenticada — evita o fetch anon (0 linhas) do
    // boot e refaz ao logar/trocar de conta na mesma aba.
    if (userId) fetchRotas()
  }, [userId, fetchRotas])

  const createRota = async (payload: RotaMotoristaInsert) => {
    const { data, error: insertError } = await supabase
      .from(TABLE_ROTAS)
      .insert(payload)
      .select('id')
      .single()

    if (insertError) {
      return { error: insertError.message }
    }

    void logAction({
      action: 'rota.created',
      entity: 'rota',
      entityId: data?.id,
      details: {
        motorista: payload.motorista,
        destino_principal: payload.destino_principal,
        data: payload.data,
      },
    })

    await fetchRotas()
    return { error: null }
  }

  const updateRota = async (id: string, payload: RotaMotoristaInsert) => {
    const { error: updateError } = await supabase
      .from(TABLE_ROTAS)
      .update(payload)
      .eq('id', id)

    if (updateError) {
      return { error: updateError.message }
    }

    await fetchRotas()
    return { error: null }
  }

  const updateRotaStatus = async (id: string, status: RotaStatus) => {
    // Atualização otimista para resposta imediata no dropdown
    setRotas((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))

    const { error: updateError } = await supabase
      .from(TABLE_ROTAS)
      .update({ status })
      .eq('id', id)

    if (updateError) {
      await fetchRotas() // reverte ao estado real do banco
      return { error: updateError.message }
    }

    return { error: null }
  }

  const deleteRota = async (id: string) => {
    const { error: deleteError } = await supabase
      .from(TABLE_ROTAS)
      .delete()
      .eq('id', id)

    if (deleteError) {
      return { error: deleteError.message }
    }

    await fetchRotas()
    return { error: null }
  }

  return {
    rotas,
    stats: computeStats(rotas),
    loading,
    error,
    refetch: fetchRotas,
    createRota,
    updateRota,
    updateRotaStatus,
    deleteRota,
  }
}
