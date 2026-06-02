import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useRotasContext } from '@/context/RotasContext'
import { useToast } from '@/hooks/use-toast'
import { rotaFormSchema, type RotaFormValues } from '@/lib/validations/rota'
import { todayISO } from '@/lib/utils'
import { STATUS_OPTIONS } from '@/types/rota'

const TIPOS_VEICULO = [
  'Van',
  'Micro-ônibus',
  'Ônibus',
  'Carro',
  'Utilitário',
  'Outro',
]

const defaultValues: RotaFormValues = {
  motorista: '',
  data: todayISO(),
  placa_veiculo: '',
  tipo_veiculo: '',
  rota_descricao: '',
  destino_principal: '',
  horario_saida: '',
  horario_retorno: '',
  qtd_passageiros: 0,
  status: 'Agendada',
  responsavel_solicitacao: '',
  observacoes: '',
}

interface RotaFormProps {
  /** Placas já cadastradas — base para autocomplete futuro */
  placasExistentes?: string[]
}

/** Formulário de cadastro de rotas inspirado na planilha SME */
export function RotaForm({ placasExistentes = [] }: RotaFormProps) {
  const { createRota } = useRotasContext()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RotaFormValues>({
    resolver: zodResolver(rotaFormSchema),
    defaultValues,
  })

  const tipoVeiculo = watch('tipo_veiculo')
  const status = watch('status')

  // datalist para autocomplete de placas (extensível)
  const placasUnicas = useMemo(
    () => [...new Set(placasExistentes.map((p) => p.toUpperCase()))].sort(),
    [placasExistentes]
  )

  const onSubmit = async (values: RotaFormValues) => {
    const { error } = await createRota({
      motorista: values.motorista.trim(),
      data: values.data,
      placa_veiculo: values.placa_veiculo,
      tipo_veiculo: values.tipo_veiculo,
      rota_descricao: values.rota_descricao.trim(),
      destino_principal: values.destino_principal.trim(),
      horario_saida: values.horario_saida,
      horario_retorno: values.horario_retorno,
      qtd_passageiros: values.qtd_passageiros,
      status: values.status,
      responsavel_solicitacao: values.responsavel_solicitacao.trim(),
      observacoes: values.observacoes?.trim() || null,
    })

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: error,
      })
      return
    }

    toast({
      variant: 'success',
      title: 'Registro salvo com sucesso!',
      description: `Rota de ${values.motorista} em ${values.data} foi cadastrada.`,
    })

    reset({ ...defaultValues, data: todayISO() })
  }

  const fieldError = (name: keyof RotaFormValues) =>
    errors[name] ? (
      <p className="text-xs text-destructive">{errors[name]?.message}</p>
    ) : null

  return (
    <Card className="mx-auto max-w-5xl shadow-md">
      <CardHeader className="border-b bg-institucional-50/50">
        <CardTitle className="text-xl text-institucional-800">
          Formulário de Registro de Rota
        </CardTitle>
        <CardDescription>
          Preencha os campos abaixo e clique em &quot;Adicionar Registro&quot; para salvar no sistema.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Linha 1: Motorista, Data, Placa */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="motorista">
                Motorista <span className="text-destructive">*</span>
              </Label>
              <Input id="motorista" placeholder="Nome do motorista" {...register('motorista')} />
              {fieldError('motorista')}
            </div>

            <div className="space-y-2">
              <Label htmlFor="data">
                Data <span className="text-destructive">*</span>
              </Label>
              <Input id="data" type="date" {...register('data')} />
              {fieldError('data')}
            </div>

            <div className="space-y-2">
              <Label htmlFor="placa_veiculo">
                Placa do Veículo <span className="text-destructive">*</span>
              </Label>
              <Input
                id="placa_veiculo"
                list="placas-list"
                placeholder="ABC1D23"
                className="uppercase"
                {...register('placa_veiculo')}
              />
              <datalist id="placas-list">
                {placasUnicas.map((placa) => (
                  <option key={placa} value={placa} />
                ))}
              </datalist>
              {fieldError('placa_veiculo')}
            </div>
          </div>

          {/* Linha 2: Tipo, Rota, Destino */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>
                Tipo de Veículo <span className="text-destructive">*</span>
              </Label>
              <Select
                value={tipoVeiculo}
                onValueChange={(v) => setValue('tipo_veiculo', v, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_VEICULO.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldError('tipo_veiculo')}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="rota_descricao">
                Rota / Descrição do Trajeto <span className="text-destructive">*</span>
              </Label>
              <Input
                id="rota_descricao"
                placeholder="Ex.: SME → Unidade Escolar Centro"
                {...register('rota_descricao')}
              />
              {fieldError('rota_descricao')}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="destino_principal">
              Destino Principal <span className="text-destructive">*</span>
            </Label>
            <Input
              id="destino_principal"
              placeholder="Destino principal da viagem"
              {...register('destino_principal')}
            />
            {fieldError('destino_principal')}
          </div>

          {/* Linha 3: Horários, Passageiros e Status */}
          <div className="grid gap-4 md:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="horario_saida">
                Horário de Saída <span className="text-destructive">*</span>
              </Label>
              <Input id="horario_saida" type="time" {...register('horario_saida')} />
              {fieldError('horario_saida')}
            </div>

            <div className="space-y-2">
              <Label htmlFor="horario_retorno">
                Horário de Retorno <span className="text-destructive">*</span>
              </Label>
              <Input id="horario_retorno" type="time" {...register('horario_retorno')} />
              {fieldError('horario_retorno')}
            </div>

            <div className="space-y-2">
              <Label htmlFor="qtd_passageiros">
                Qtd. Passageiros <span className="text-destructive">*</span>
              </Label>
              <Input
                id="qtd_passageiros"
                type="number"
                min={0}
                {...register('qtd_passageiros')}
              />
              {fieldError('qtd_passageiros')}
            </div>

            <div className="space-y-2">
              <Label>
                Status da Rota <span className="text-destructive">*</span>
              </Label>
              <Select value={status} onValueChange={(v) => setValue('status', v as RotaFormValues['status'], { shouldValidate: true })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((statusOption) => (
                    <SelectItem key={statusOption} value={statusOption}>
                      {statusOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldError('status')}
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsavel_solicitacao">
                Responsável pela Solicitação <span className="text-destructive">*</span>
              </Label>
              <Input
                id="responsavel_solicitacao"
                placeholder="Nome do responsável"
                {...register('responsavel_solicitacao')}
              />
              {fieldError('responsavel_solicitacao')}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              placeholder="Informações adicionais (opcional)"
              rows={3}
              {...register('observacoes')}
            />
          </div>

          <div className="flex justify-end border-t pt-4">
            <Button type="submit" size="lg" disabled={isSubmitting} className="min-w-[200px]">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Adicionar Registro
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
