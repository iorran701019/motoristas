import { z } from 'zod'

/** Schema de cadastro de usuário (admin) */
export const usuarioFormSchema = z.object({
  email: z.string().email('Informe um e-mail válido'),
  password: z.string().min(6, 'A senha deve ter ao menos 6 caracteres'),
  nome_completo: z.string().trim().min(3, 'Informe o nome completo'),
  matricula: z
    .string()
    .regex(/^[0-9]{6}$/, 'A matrícula deve ter exatamente 6 dígitos numéricos.'),
  isAdmin: z.boolean(),
})

export type UsuarioFormValues = z.infer<typeof usuarioFormSchema>
