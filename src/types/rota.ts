/** Registro de rota conforme tabela rotas_motoristas no Supabase */
export const STATUS_OPTIONS = ['Agendada', 'Concluída', 'Cancelada', 'Adiada'] as const
export type RotaStatus = (typeof STATUS_OPTIONS)[number]

export interface RotaMotorista {
  id: string
  motorista: string
  data: string
  placa_veiculo: string
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

/** Registro de auditoria (tabela audit_logs); leitura restrita a admin via RLS */
export interface AuditLog {
  id: string
  created_at: string
  actor_id: string | null
  actor_email: string | null
  action: string
  entity: string | null
  entity_id: string | null
  details: Record<string, unknown> | null
}

/** Cadastro de motorista (tabela motoristas) */
export interface Motorista {
  id: string
  nome_completo: string
  matricula: string
  created_at: string
}

export type MotoristaInsert = Omit<Motorista, 'id' | 'created_at'>

/** Cadastro de veículo (tabela veiculos) */
export interface Veiculo {
  id: string
  placa: string
  modelo: string
  cor: string
  created_at: string
}

export type VeiculoInsert = Omit<Veiculo, 'id' | 'created_at'>
