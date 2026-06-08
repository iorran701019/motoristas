import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCadastrosContext } from '@/context/CadastrosContext'
import { useToast } from '@/hooks/use-toast'
import { motoristaFormSchema, type MotoristaFormValues } from '@/lib/validations/cadastro'

const defaultValues: MotoristaFormValues = { nome_completo: '', matricula: '' }

/** Formulário de cadastro de motorista */
export function MotoristaForm() {
  const { createMotorista } = useCadastrosContext()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MotoristaFormValues>({
    resolver: zodResolver(motoristaFormSchema),
    defaultValues,
  })

  // Registro da matrícula com sanitização: só dígitos, máx. 6
  const matriculaReg = register('matricula')

  const onSubmit = async (values: MotoristaFormValues) => {
    const { error } = await createMotorista(values)
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao salvar motorista', description: error })
      return
    }
    toast({ variant: 'success', title: 'Motorista cadastrado', description: values.nome_completo })
    reset(defaultValues)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-[2fr_1fr_auto] sm:items-end">
      <div className="space-y-2">
        <Label htmlFor="nome_completo">
          Nome completo <span className="text-destructive">*</span>
        </Label>
        <Input id="nome_completo" placeholder="Nome do motorista" {...register('nome_completo')} />
        {errors.nome_completo && (
          <p className="text-xs text-destructive">{errors.nome_completo.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="matricula">
          Matrícula <span className="text-destructive">*</span>
        </Label>
        <Input
          id="matricula"
          inputMode="numeric"
          maxLength={6}
          placeholder="Ex.: 123456"
          {...matriculaReg}
          onChange={(e) => {
            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6)
            matriculaReg.onChange(e)
          }}
        />
        {errors.matricula && <p className="text-xs text-destructive">{errors.matricula.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
        Adicionar
      </Button>
    </form>
  )
}
