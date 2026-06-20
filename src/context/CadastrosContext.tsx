import { createContext, useContext, type ReactNode } from 'react'
import { useCadastros } from '@/hooks/useCadastros'
import { useSetores } from '@/hooks/useSetores'
import type {
  Motorista,
  MotoristaInsert,
  Setor,
  Veiculo,
  VeiculoInsert,
} from '@/types/rota'

interface CadastrosContextValue {
  motoristas: Motorista[]
  veiculos: Veiculo[]
  /** Setores da SME (somente leitura aqui; o CRUD vive no Painel Admin) */
  setores: Setor[]
  /** Estado do fetch de setores, propagado para distinguir "carregando"/"erro"/"vazio" */
  setoresLoading: boolean
  setoresError: string | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createMotorista: (data: MotoristaInsert) => Promise<{ error: string | null }>
  deleteMotorista: (id: string) => Promise<{ error: string | null }>
  createVeiculo: (data: VeiculoInsert) => Promise<{ error: string | null }>
  deleteVeiculo: (id: string) => Promise<{ error: string | null }>
}

const CadastrosContext = createContext<CadastrosContextValue | null>(null)

/** Provider global de motoristas, veículos e setores */
export function CadastrosProvider({ children }: { children: ReactNode }) {
  const cadastros = useCadastros()
  const { setores, loading: setoresLoading, error: setoresError } = useSetores()
  return (
    <CadastrosContext.Provider value={{ ...cadastros, setores, setoresLoading, setoresError }}>
      {children}
    </CadastrosContext.Provider>
  )
}

export function useCadastrosContext() {
  const ctx = useContext(CadastrosContext)
  if (!ctx) {
    throw new Error('useCadastrosContext deve ser usado dentro de CadastrosProvider')
  }
  return ctx
}
