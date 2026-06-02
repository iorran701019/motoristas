import { z } from 'zod'

/** Schema de validação do formulário de cadastro de rotas */
export const rotaFormSchema = z.object({
  motorista: z.string().min(2, 'Informe o nome do motorista'),
  data: z.string().min(1, 'Informe a data da rota'),
  placa_veiculo: z
    .string()
    .min(7, 'Placa inválida')
    .max(8, 'Placa inválida')
    .transform((v) => v.toUpperCase().replace(/[^A-Z0-9]/g, '')),
  rota_descricao: z.string().min(3, 'Descreva a rota ou trajeto'),
  destino_principal: z.string().min(2, 'Informe o destino principal'),
  horario_saida: z.string().min(1, 'Informe o horário de saída'),
  horario_retorno: z.string().min(1, 'Informe o horário de retorno'),
  qtd_passageiros: z.coerce
    .number()
    .int('Quantidade deve ser um número inteiro')
    .min(0, 'Quantidade não pode ser negativa'),
  responsavel_solicitacao: z.string().min(2, 'Informe o responsável pela solicitação'),
  observacoes: z.string().optional(),
})

export type RotaFormValues = z.infer<typeof rotaFormSchema>
