import { z } from 'zod'

/** Schema de cadastro de motorista */
export const motoristaFormSchema = z.object({
  nome_completo: z.string().min(3, 'Informe o nome completo'),
  matricula: z.string().min(1, 'Informe a matrícula'),
})

export type MotoristaFormValues = z.infer<typeof motoristaFormSchema>

/** Schema de cadastro de veículo */
export const veiculoFormSchema = z.object({
  placa: z
    .string()
    .min(7, 'Placa inválida')
    .max(8, 'Placa inválida')
    .transform((v) => v.toUpperCase().replace(/[^A-Z0-9]/g, '')),
  modelo: z.string().min(1, 'Informe o modelo'),
  cor: z.string().min(1, 'Informe a cor'),
  tipo: z.string().min(1, 'Selecione o tipo de veículo'),
})

export type VeiculoFormValues = z.infer<typeof veiculoFormSchema>

/** Tipos de veículo disponíveis no cadastro */
export const TIPOS_VEICULO = [
  'Van',
  'Micro-ônibus',
  'Ônibus',
  'Carro',
  'Utilitário',
  'Outro',
] as const
