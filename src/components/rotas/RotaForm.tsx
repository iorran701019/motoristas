import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, AlertTriangle, Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { formatDateBR, formatTime, intervalosSobrepoem, todayISO } from '@/lib/utils'
import type { Motorista, RotaMotorista, RotaMotoristaInsert, Setor, Veiculo } from '@/types/rota'

const defaultValues: RotaFormValues = {
  motorista: '',
  setor_id: '',
  data: todayISO(),
  placa_veiculo: '',
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
  /** Setores da SME — base do seletor de setor */
  setores?: Setor[]
  /** Estado do fetch de setores (para distinguir carregando / erro / vazio) */
  setoresLoading?: boolean
  setoresError?: string | null
}

/** Formulário de cadastro de rotas inspirado na planilha SME */
export function RotaForm({
  motoristas = [],
  veiculos = [],
  setores = [],
  setoresLoading = false,
  setoresError = null,
}: RotaFormProps) {
  const { rotas, createRota, updateRota } = useRotasContext()
  const { toast } = useToast()

  // Estado do pop-up de conflito de horário
  const [conflito, setConflito] = useState<RotaMotorista | null>(null)
  const [pendingPayload, setPendingPayload] = useState<RotaMotoristaInsert | null>(null)
  const [substituindo, setSubstituindo] = useState(false)

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
  const setorSelecionado = watch('setor_id')

  const semCadastros =
    motoristas.length === 0 || veiculos.length === 0 || setores.length === 0

  const limparForm = () => reset({ ...defaultValues, data: todayISO() })

  const buildPayload = (values: RotaFormValues): RotaMotoristaInsert => ({
    motorista: values.motorista.trim(),
    setor_id: values.setor_id,
    data: values.data,
    placa_veiculo: values.placa_veiculo,
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

  const salvarNovo = async (payload: RotaMotoristaInsert) => {
    const { error } = await createRota(payload)
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao salvar', description: error })
      return
    }
    toast({
      variant: 'success',
      title: 'Registro salvo com sucesso!',
      description: `Rota de ${payload.motorista} em ${payload.data} foi cadastrada.`,
    })
    limparForm()
  }

  const onSubmit = async (values: RotaFormValues) => {
    // Horário de retorno precisa ser depois da saída
    if (formatTime(values.horario_retorno) <= formatTime(values.horario_saida)) {
      toast({
        variant: 'destructive',
        title: 'Horário inválido',
        description: 'O horário de retorno deve ser depois do horário de saída.',
      })
      return
    }

    const payload = buildPayload(values)

    // Verifica conflito de horário do mesmo motorista na mesma data
    // (ignora rotas canceladas, que não ocupam a agenda).
    const rotaConflitante = rotas.find(
      (r) =>
        r.status !== 'Cancelada' &&
        r.data === values.data &&
        r.motorista.trim().toLowerCase() === values.motorista.trim().toLowerCase() &&
        intervalosSobrepoem(
          values.horario_saida,
          values.horario_retorno,
          r.horario_saida,
          r.horario_retorno
        )
    )

    if (rotaConflitante) {
      // Abre o pop-up para o usuário decidir: cancelar ou substituir
      setConflito(rotaConflitante)
      setPendingPayload(payload)
      return
    }

    await salvarNovo(payload)
  }

  const fecharDialogo = () => {
    setConflito(null)
    setPendingPayload(null)
  }

  // "Substituir o antigo": sobrescreve a rota conflitante com os novos dados
  const handleSubstituir = async () => {
    if (!conflito || !pendingPayload) return
    setSubstituindo(true)
    const { error } = await updateRota(conflito.id, pendingPayload)
    setSubstituindo(false)

    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao substituir', description: error })
      return
    }
    toast({
      variant: 'success',
      title: 'Rota substituída',
      description: `A rota anterior de ${pendingPayload.motorista} foi atualizada.`,
    })
    fecharDialogo()
    limparForm()
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
            </Link>
            {setores.length === 0 && ' e os setores (no Painel Admin)'} antes de registrar uma
            rota — eles aparecem nos campos de seleção abaixo.
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
              <Select
                value={placaSelecionada}
                onValueChange={(v) => setValue('placa_veiculo', v, { shouldValidate: true })}
              >
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

          {/* Linha 1b: Setor da SME */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>
                Setor da SME <span className="text-destructive">*</span>
              </Label>
              {setoresError ? (
                <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Erro ao carregar setores. Recarregue a página.</span>
                </div>
              ) : setoresLoading ? (
                <Select disabled value="">
                  <SelectTrigger>
                    <SelectValue placeholder="Carregando setores..." />
                  </SelectTrigger>
                </Select>
              ) : setores.length === 0 ? (
                <p className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
                  Nenhum setor cadastrado. Peça a um admin para cadastrar.
                </p>
              ) : (
                <Select
                  value={setorSelecionado}
                  onValueChange={(v) => setValue('setor_id', v, { shouldValidate: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o setor" />
                  </SelectTrigger>
                  <SelectContent>
                    {setores.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {fieldError('setor_id')}
            </div>
          </div>

          {/* Linha 2: Rota */}
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="rota_descricao">
                Rota / Descrição do Trajeto <span className="text-destructive">*</span>
              </Label>
              <Input
                id="rota_descricao"
                placeholder="Ex.: SME → Unidade Escolar Centro"
                maxLength={60}
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
              maxLength={30}
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
                min={1}
                max={4}
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
                maxLength={30}
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

      {/* Pop-up de conflito de horário */}
      <Dialog open={conflito !== null} onOpenChange={(open) => !open && fecharDialogo()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="h-5 w-5" />
              Conflito de horário
            </DialogTitle>
            <DialogDescription>
              Este motorista já tem uma rota que se sobrepõe a este horário.
            </DialogDescription>
          </DialogHeader>

          {conflito && pendingPayload && (
            <div className="space-y-3 text-sm">
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
                  Rota já existente
                </p>
                <p className="font-medium">{conflito.motorista}</p>
                <p className="text-muted-foreground">
                  {formatDateBR(conflito.data)} · {formatTime(conflito.horario_saida)} às{' '}
                  {formatTime(conflito.horario_retorno)}
                </p>
                <p className="text-muted-foreground">
                  {conflito.rota_descricao} → {conflito.destino_principal}
                </p>
              </div>

              <div className="rounded-md border bg-muted/30 p-3">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Novo cadastro
                </p>
                <p className="font-medium">{pendingPayload.motorista}</p>
                <p className="text-muted-foreground">
                  {formatDateBR(pendingPayload.data)} · {formatTime(pendingPayload.horario_saida)}{' '}
                  às {formatTime(pendingPayload.horario_retorno)}
                </p>
                <p className="text-muted-foreground">
                  {pendingPayload.rota_descricao} → {pendingPayload.destino_principal}
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={fecharDialogo} disabled={substituindo}>
              Cancelar novo cadastro
            </Button>
            <Button onClick={handleSubstituir} disabled={substituindo}>
              {substituindo ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Substituir o antigo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
