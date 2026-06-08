import { createContext, useContext, type ReactNode } from 'react'
import { useCadastros } from '@/hooks/useCadastros'
import type {
  Motorista,
  MotoristaInsert,
  Veiculo,
  VeiculoInsert,
} from '@/types/rota'

interface CadastrosContextValue {
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

const CadastrosContext = createContext<CadastrosContextValue | null>(null)

/** Provider global de motoristas e veículos */
export function CadastrosProvider({ children }: { children: ReactNode }) {
  const value = useCadastros()
  return <CadastrosContext.Provider value={value}>{children}</CadastrosContext.Provider>
}

export function useCadastrosContext() {
  const ctx = useContext(CadastrosContext)
  if (!ctx) {
    throw new Error('useCadastrosContext deve ser usado dentro de CadastrosProvider')
  }
  return ctx
}
