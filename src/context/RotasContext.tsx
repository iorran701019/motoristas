import { createContext, useContext, type ReactNode } from 'react'
import { useRotas } from '@/hooks/useRotas'
import type {
  DashboardStats,
  RotaMotorista,
  RotaMotoristaInsert,
  RotaStatus,
} from '@/types/rota'

interface RotasContextValue {
  rotas: RotaMotorista[]
  stats: DashboardStats
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createRota: (data: RotaMotoristaInsert) => Promise<{ error: string | null }>
  updateRota: (id: string, data: RotaMotoristaInsert) => Promise<{ error: string | null }>
  updateRotaStatus: (id: string, status: RotaStatus) => Promise<{ error: string | null }>
}

const RotasContext = createContext<RotasContextValue | null>(null)

/** Provider global de dados — evita múltiplos fetches e prepara auth futura */
export function RotasProvider({ children }: { children: ReactNode }) {
  const value = useRotas()
  return <RotasContext.Provider value={value}>{children}</RotasContext.Provider>
}

export function useRotasContext() {
  const ctx = useContext(RotasContext)
  if (!ctx) {
    throw new Error('useRotasContext deve ser usado dentro de RotasProvider')
  }
  return ctx
}
