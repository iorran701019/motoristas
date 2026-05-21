/** Registro de rota conforme tabela rotas_motoristas no Supabase */
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
