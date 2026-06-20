import { z } from 'zod'

/** Schema de validação do formulário de cadastro de rotas */
export const rotaFormSchema = z.object({
  motorista: z.string().min(2, 'Informe o nome do motorista'),
  setor_id: z.string().min(1, 'Selecione o setor da SME'),
  data: z.string().min(1, 'Informe a data da rota'),
  placa_veiculo: z
    .string()
    .min(7, 'Placa inválida')
    .max(8, 'Placa inválida')
    .transform((v) => v.toUpperCase().replace(/[^A-Z0-9]/g, '')),
  rota_descricao: z
    .string()
    .min(3, 'Descreva a rota ou trajeto')
    .max(60, 'Máximo de 60 caracteres'),
  destino_principal: z
    .string()
    .min(2, 'Informe o destino principal')
    .max(30, 'Máximo de 30 caracteres'),
  horario_saida: z.string().min(1, 'Informe o horário de saída'),
  horario_retorno: z.string().min(1, 'Informe o horário de retorno'),
  qtd_passageiros: z.coerce
    .number()
    .int('Quantidade deve ser um número inteiro')
    .min(1, 'Mínimo de 1 passageiro')
    .max(4, 'Máximo de 4 passageiros'),
  responsavel_solicitacao: z
    .string()
    .min(2, 'Informe o responsável pela solicitação')
    .max(30, 'Máximo de 30 caracteres'),
  observacoes: z.string().optional(),
}).superRefine((values, ctx) => {
  // Tempo mínimo de rota: 1 hora (60 min) entre saída e retorno.
  // Só valida quando ambos os horários estão preenchidos no formato HH:MM.
  const match = /^(\d{2}):(\d{2})$/
  const saida = match.exec(values.horario_saida)
  const retorno = match.exec(values.horario_retorno)
  if (!saida || !retorno) return

  const minutosSaida = Number(saida[1]) * 60 + Number(saida[2])
  const minutosRetorno = Number(retorno[1]) * 60 + Number(retorno[2])
  // Mesmo dia: a ordenação (retorno depois da saída) é validada no onSubmit.
  // Aqui só checamos a duração quando o retorno é de fato posterior à saída.
  if (minutosRetorno <= minutosSaida) return

  if (minutosRetorno - minutosSaida < 60) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'A rota deve ter no mínimo 1 hora de duração',
      path: ['horario_retorno'],
    })
  }
})

export type RotaFormValues = z.infer<typeof rotaFormSchema>
