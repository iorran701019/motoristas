import { z } from 'zod'

/** Schema do formulário de setor da SME (admin) */
export const setorFormSchema = z.object({
  nome: z.string().trim().min(1, 'Nome do setor é obrigatório'),
  cor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida (use formato hex, ex: #1E40AF)'),
})

export type SetorFormValues = z.infer<typeof setorFormSchema>
