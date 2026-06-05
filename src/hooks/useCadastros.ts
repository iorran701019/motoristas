import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { logAction } from '@/lib/audit'
import { getSupabaseConfig } from '@/lib/supabase-config'
import type {
  Motorista,
  MotoristaInsert,
  Veiculo,
  VeiculoInsert,
} from '@/types/rota'

interface UseCadastrosReturn {
  motoristas: Motorista[]
  veiculos: Veiculo[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createMotorista: (data: MotoristaInsert) => Promise<{ error: string | null }>
  deleteMotorista: (id: string) => Promise<{ error: string | null }>
  createVeiculo: (data: VeiculoInsert) => Promise<{ error: string | null }>
  deleteVeiculo: (id: string) => Promise<{ error: string | null }>
}

/**
 * Hook central de cadastros base (motoristas e veículos).
 * Compartilhado entre a tela de gerência e o formulário de rotas.
 */
export function useCadastros(): UseCadastrosReturn {
  const [motoristas, setMotoristas] = useState<Motorista[]>([])
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCadastros = useCallback(async () => {
    setLoading(true)
    setError(null)

    if (!getSupabaseConfig().isConfigured) {
      setMotoristas([])
      setVeiculos([])
      setLoading(false)
      return
    }

    const [motoristasRes, veiculosRes] = await Promise.all([
      supabase.from('motoristas').select('*').order('nome_completo', { ascending: true }),
      supabase.from('veiculos').select('*').order('placa', { ascending: true }),
    ])

    if (motoristasRes.error || veiculosRes.error) {
      setError(motoristasRes.error?.message ?? veiculosRes.error?.message ?? 'Erro ao carregar cadastros')
      setMotoristas([])
      setVeiculos([])
    } else {
      setMotoristas((motoristasRes.data as Motorista[]) ?? [])
      setVeiculos((veiculosRes.data as Veiculo[]) ?? [])
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    fetchCadastros()
  }, [fetchCadastros])

  const createMotorista = async (payload: MotoristaInsert) => {
    const { data, error: insertError } = await supabase
      .from('motoristas')
      .insert(payload)
      .select('id')
      .single()
    if (insertError) return { error: insertError.message }
    // Log best-effort, sem bloquear o fluxo (exclusões são cobertas por trigger SQL)
    void logAction({
      action: 'motorista.created',
      entity: 'motorista',
      entityId: data?.id,
      details: { nome_completo: payload.nome_completo, matricula: payload.matricula },
    })
    await fetchCadastros()
    return { error: null }
  }

  const deleteMotorista = async (id: string) => {
    const { error: deleteError } = await supabase.from('motoristas').delete().eq('id', id)
    if (deleteError) return { error: deleteError.message }
    await fetchCadastros()
    return { error: null }
  }

  const createVeiculo = async (payload: VeiculoInsert) => {
    const { data, error: insertError } = await supabase
      .from('veiculos')
      .insert(payload)
      .select('id')
      .single()
    if (insertError) return { error: insertError.message }
    void logAction({
      action: 'veiculo.created',
      entity: 'veiculo',
      entityId: data?.id,
      details: { placa: payload.placa, modelo: payload.modelo, cor: payload.cor },
    })
    await fetchCadastros()
    return { error: null }
  }

  const deleteVeiculo = async (id: string) => {
    const { error: deleteError } = await supabase.from('veiculos').delete().eq('id', id)
    if (deleteError) return { error: deleteError.message }
    await fetchCadastros()
    return { error: null }
  }

  return {
    motoristas,
    veiculos,
    loading,
    error,
    refetch: fetchCadastros,
    createMotorista,
    deleteMotorista,
    createVeiculo,
    deleteVeiculo,
  }
}
