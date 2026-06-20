import { z } from 'zod'

/** Schema do formulário de setor da SME (admin) */
export const setorFormSchema = z.object({
  nome: z.string().trim().min(1, 'Nome do setor é obrigatório'),
})

export type SetorFormValues = z.infer<typeof setorFormSchema>
