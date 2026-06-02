import { Link } from 'react-router-dom'
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
import type { Motorista, Veiculo } from '@/types/rota'

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
  responsavel_solicitacao: '',
  observacoes: '',
}

interface RotaFormProps {
  /** Motoristas cadastrados — base do seletor de motorista */
  motoristas?: Motorista[]
  /** Veículos cadastrados — base do seletor de placa */
  veiculos?: Veiculo[]
}

/** Formulário de cadastro de rotas inspirado na planilha SME */
export function RotaForm({ motoristas = [], veiculos = [] }: RotaFormProps) {
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

  const motoristaSelecionado = watch('motorista')
  const placaSelecionada = watch('placa_veiculo')
  const tipoVeiculo = watch('tipo_veiculo')

  const semCadastros = motoristas.length === 0 || veiculos.length === 0

  const handlePlacaChange = (placa: string) => {
    setValue('placa_veiculo', placa, { shouldValidate: true })
    const veiculo = veiculos.find((v) => v.placa === placa)
    setValue('tipo_veiculo', veiculo?.tipo ?? '', { shouldValidate: true })
  }

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
      // Toda rota nasce Agendada; status muda no Histórico de trajetos.
      status: 'Agendada',
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
        {semCadastros && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Cadastre{' '}
            <Link to="/cadastros" className="font-medium underline">
              motoristas e veículos
            </Link>{' '}
            antes de registrar uma rota — eles aparecem nos campos de seleção abaixo.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Linha 1: Motorista, Data, Placa */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>
                Motorista <span className="text-destructive">*</span>
              </Label>
              <Select
                value={motoristaSelecionado}
                onValueChange={(v) => setValue('motorista', v, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o motorista" />
                </SelectTrigger>
                <SelectContent>
                  {motoristas.map((m) => (
                    <SelectItem key={m.id} value={m.nome_completo}>
                      {m.nome_completo} — {m.matricula}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Label>
                Placa do Veículo <span className="text-destructive">*</span>
              </Label>
              <Select value={placaSelecionada} onValueChange={handlePlacaChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a placa" />
                </SelectTrigger>
                <SelectContent>
                  {veiculos.map((v) => (
                    <SelectItem key={v.id} value={v.placa}>
                      {v.placa} — {v.modelo} ({v.cor})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldError('placa_veiculo')}
            </div>
          </div>

          {/* Linha 2: Tipo (derivado), Rota */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="tipo_veiculo">Tipo de Veículo</Label>
              <Input
                id="tipo_veiculo"
                value={tipoVeiculo}
                readOnly
                placeholder="Definido pela placa"
                className="bg-muted/50"
              />
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

          {/* Linha 3: Horários, Passageiros e Responsável */}
          <div className="grid gap-4 md:grid-cols-4">
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
              <Label htmlFor="responsavel_solicitacao">
                Responsável <span className="text-destructive">*</span>
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

          <div className="flex items-center justify-end gap-3 border-t pt-4">
            <p className="mr-auto text-xs text-muted-foreground">
              A rota será registrada com status <strong>Agendada</strong>.
            </p>
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
