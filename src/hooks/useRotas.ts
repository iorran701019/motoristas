import { useCallback, useEffect, useState } from 'react'
import { supabase, TABLE_ROTAS } from '@/lib/supabase'
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
    fetchRotas()
  }, [fetchRotas])

  const createRota = async (payload: RotaMotoristaInsert) => {
    const { error: insertError } = await supabase.from(TABLE_ROTAS).insert(payload)

    if (insertError) {
      return { error: insertError.message }
    }

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

  return {
    rotas,
    stats: computeStats(rotas),
    loading,
    error,
    refetch: fetchRotas,
    createRota,
    updateRota,
    updateRotaStatus,
  }
}
