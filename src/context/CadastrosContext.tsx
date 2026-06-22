import { createContext, useContext, type ReactNode } from 'react'
import { useCadastros } from '@/hooks/useCadastros'
import { useSetores } from '@/hooks/useSetores'
import type {
  Motorista,
  MotoristaInsert,
  Setor,
  SetorInsert,
  Veiculo,
  VeiculoInsert,
} from '@/types/rota'

interface CadastrosContextValue {
  motoristas: Motorista[]
  veiculos: Veiculo[]
  /**
   * Setores da SME — FONTE ÚNICA. Esta é a única instância de useSetores do app
   * (montada aqui no provider). O CRUD do Painel Admin (SetoresManager) opera por
   * estas mesmas funções, então criar/editar/excluir setor reflete imediatamente
   * no RotaForm, no calendário e na RotasTable, sem F5.
   */
  setores: Setor[]
  /** Estado do fetch de setores, propagado para distinguir "carregando"/"erro"/"vazio" */
  setoresLoading: boolean
  setoresError: string | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  refetchSetores: () => Promise<void>
  createMotorista: (data: MotoristaInsert) => Promise<{ error: string | null }>
  deleteMotorista: (id: string) => Promise<{ error: string | null }>
  createVeiculo: (data: VeiculoInsert) => Promise<{ error: string | null }>
  deleteVeiculo: (id: string) => Promise<{ error: string | null }>
  createSetor: (data: SetorInsert) => Promise<{ error: string | null }>
  updateSetor: (id: string, data: SetorInsert) => Promise<{ error: string | null }>
  deleteSetor: (id: string) => Promise<{ error: string | null }>
}

const CadastrosContext = createContext<CadastrosContextValue | null>(null)

/** Provider global de motoristas, veículos e setores */
export function CadastrosProvider({ children }: { children: ReactNode }) {
  const cadastros = useCadastros()
  // Instância ÚNICA de useSetores no app: expõe estado + mutações para que o
  // Painel Admin e os consumidores de leitura compartilhem a mesma fonte.
  const {
    setores,
    loading: setoresLoading,
    error: setoresError,
    refetch: refetchSetores,
    createSetor,
    updateSetor,
    deleteSetor,
  } = useSetores()
  return (
    <CadastrosContext.Provider
      value={{
        ...cadastros,
        setores,
        setoresLoading,
        setoresError,
        refetchSetores,
        createSetor,
        updateSetor,
        deleteSetor,
      }}
    >
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
