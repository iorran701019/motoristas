import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCadastrosContext } from '@/context/CadastrosContext'
import { useToast } from '@/hooks/use-toast'
import {
  TIPOS_VEICULO,
  veiculoFormSchema,
  type VeiculoFormValues,
} from '@/lib/validations/cadastro'

const defaultValues: VeiculoFormValues = { placa: '', modelo: '', cor: '', tipo: '' }

/** Formulário de cadastro de veículo */
export function VeiculoForm() {
  const { createVeiculo } = useCadastrosContext()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<VeiculoFormValues>({
    resolver: zodResolver(veiculoFormSchema),
    defaultValues,
  })

  const tipo = watch('tipo')

  const onSubmit = async (values: VeiculoFormValues) => {
    const { error } = await createVeiculo(values)
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao salvar veículo', description: error })
      return
    }
    toast({ variant: 'success', title: 'Veículo cadastrado', description: values.placa })
    reset(defaultValues)
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] lg:items-end"
    >
      <div className="space-y-2">
        <Label htmlFor="placa">
          Placa <span className="text-destructive">*</span>
        </Label>
        <Input id="placa" placeholder="ABC1D23" className="uppercase" {...register('placa')} />
        {errors.placa && <p className="text-xs text-destructive">{errors.placa.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="modelo">
          Modelo <span className="text-destructive">*</span>
        </Label>
        <Input id="modelo" placeholder="Ex.: Sprinter" {...register('modelo')} />
        {errors.modelo && <p className="text-xs text-destructive">{errors.modelo.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="cor">
          Cor <span className="text-destructive">*</span>
        </Label>
        <Input id="cor" placeholder="Ex.: Branco" {...register('cor')} />
        {errors.cor && <p className="text-xs text-destructive">{errors.cor.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>
          Tipo <span className="text-destructive">*</span>
        </Label>
        <Select value={tipo} onValueChange={(v) => setValue('tipo', v, { shouldValidate: true })}>
          <SelectTrigger>
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            {TIPOS_VEICULO.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.tipo && <p className="text-xs text-destructive">{errors.tipo.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        Adicionar
      </Button>
    </form>
  )
}
