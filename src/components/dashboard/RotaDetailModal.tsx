import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatDateBR, formatTime } from '@/lib/utils'
import type { RotaMotorista } from '@/types/rota'

interface RotaDetailModalProps {
  rota: RotaMotorista | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Modal com detalhes completos de uma rota (aberto pelo calendário ou tabela) */
export function RotaDetailModal({ rota, open, onOpenChange }: RotaDetailModalProps) {
  if (!rota) return null

  const fields = [
    { label: 'Motorista', value: rota.motorista },
    { label: 'Data', value: formatDateBR(rota.data) },
    { label: 'Placa', value: rota.placa_veiculo },
    { label: 'Tipo de Veículo', value: rota.tipo_veiculo },
    { label: 'Rota / Trajeto', value: rota.rota_descricao },
    { label: 'Destino Principal', value: rota.destino_principal },
    { label: 'Horário de Saída', value: formatTime(rota.horario_saida) },
    { label: 'Horário de Retorno', value: formatTime(rota.horario_retorno) },
    { label: 'Passageiros', value: String(rota.qtd_passageiros) },
    { label: 'Responsável', value: rota.responsavel_solicitacao },
    { label: 'Observações', value: rota.observacoes || '—' },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalhes da Rota</DialogTitle>
          <DialogDescription>
            {rota.motorista} — {formatDateBR(rota.data)}
          </DialogDescription>
        </DialogHeader>

        <dl className="grid gap-3 sm:grid-cols-2">
          {fields.map(({ label, value }) => (
            <div key={label} className={label === 'Rota / Trajeto' || label === 'Observações' ? 'sm:col-span-2' : ''}>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {label}
              </dt>
              <dd className="mt-0.5 text-sm text-foreground">{value}</dd>
            </div>
          ))}
        </dl>
      </DialogContent>
    </Dialog>
  )
}
