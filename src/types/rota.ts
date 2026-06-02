/** Registro de rota conforme tabela rotas_motoristas no Supabase */
export const STATUS_OPTIONS = ['Agendada', 'Executada', 'Cancelada', 'Adiada'] as const
export type RotaStatus = (typeof STATUS_OPTIONS)[number]

export interface RotaMotorista {
  id: string
  motorista: string
  data: string
  placa_veiculo: string
  tipo_veiculo: string
  rota_descricao: string
  destino_principal: string
  horario_saida: string
  horario_retorno: string
  qtd_passageiros: number
  status: RotaStatus
  responsavel_solicitacao: string
  observacoes: string | null
  created_at: string
}

/** Payload para inserção (sem id e created_at) */
export type RotaMotoristaInsert = Omit<RotaMotorista, 'id' | 'created_at'>

/** Métricas agregadas do dashboard */
export interface DashboardStats {
  totalRotas: number
  totalMotoristas: number
  rotasHoje: number
  totalPassageiros: number
}

export interface AuthUserSummary {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  is_admin: boolean
}
