import { useMemo, useState } from 'react'
import { Printer } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRotasContext } from '@/context/RotasContext'
import { formatDateBR, formatTime, getStatusClasses } from '@/lib/utils'
import { STATUS_OPTIONS, type RotaStatus } from '@/types/rota'

/** Tela de relatório imprimível do histórico de trajetos */
export function RelatorioPage() {
  const { rotas } = useRotasContext()

  const [statusSel, setStatusSel] = useState<RotaStatus[]>([...STATUS_OPTIONS])
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [motoristaFilter, setMotoristaFilter] = useState('todos')

  const motoristas = useMemo(
    () => Array.from(new Set(rotas.map((r) => r.motorista))).sort(),
    [rotas]
  )

  const toggleStatus = (status: RotaStatus) => {
    setStatusSel((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    )
  }

  const resultado = useMemo(() => {
    return rotas
      .filter((r) => {
        if (!statusSel.includes(r.status)) return false
        if (dataInicio && r.data < dataInicio) return false
        if (dataFim && r.data > dataFim) return false
        if (motoristaFilter !== 'todos' && r.motorista !== motoristaFilter) return false
        return true
      })
      .sort((a, b) => (a.data < b.data ? -1 : a.data > b.data ? 1 : 0))
  }, [rotas, statusSel, dataInicio, dataFim, motoristaFilter])

  const periodoLabel =
    dataInicio || dataFim
      ? `${dataInicio ? formatDateBR(dataInicio) : '…'} a ${dataFim ? formatDateBR(dataFim) : '…'}`
      : 'Todo o período'

  return (
    <div className="space-y-6">
      {/* Filtros — não aparecem na impressão */}
      <Card className="no-print">
        <CardHeader>
          <CardTitle className="text-lg">Relatório de Trajetos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-2 block">Status (selecione um ou mais)</Label>
            <div className="flex flex-wrap gap-4">
              {STATUS_OPTIONS.map((s) => (
                <label key={s} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={statusSel.includes(s)}
                    onChange={() => toggleStatus(s)}
                  />
                  {s}
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="data-inicio">Data início</Label>
              <Input
                id="data-inicio"
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data-fim">Data fim</Label>
              <Input
                id="data-fim"
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Motorista</Label>
              <Select value={motoristaFilter} onValueChange={setMotoristaFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Motorista" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os motoristas</SelectItem>
                  {motoristas.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <p className="text-sm text-muted-foreground">
              {resultado.length} trajeto(s) no resultado
            </p>
            <Button onClick={() => window.print()} disabled={resultado.length === 0}>
              <Printer className="h-4 w-4" />
              Imprimir / Salvar PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Área imprimível */}
      <div id="relatorio-print" className="rounded-lg border bg-white p-6">
        <div className="mb-4 border-b pb-4">
          <h2 className="text-xl font-bold text-institucional-800">
            Relatório de Trajetos - SME - PMBM
          </h2>
          <p className="text-sm text-muted-foreground">
            Período: {periodoLabel} · Status: {statusSel.join(', ') || '—'}
            {motoristaFilter !== 'todos' ? ` · Motorista: ${motoristaFilter}` : ''}
          </p>
          <p className="text-sm text-muted-foreground">
            Total de trajetos: {resultado.length}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Data</th>
                <th className="px-3 py-2 text-left font-medium">Motorista</th>
                <th className="px-3 py-2 text-left font-medium">Placa</th>
                <th className="px-3 py-2 text-left font-medium">Rota</th>
                <th className="px-3 py-2 text-left font-medium">Destino</th>
                <th className="px-3 py-2 text-left font-medium">Saída</th>
                <th className="px-3 py-2 text-left font-medium">Retorno</th>
                <th className="px-3 py-2 text-left font-medium">Pass.</th>
                <th className="px-3 py-2 text-left font-medium">Status</th>
                <th className="px-3 py-2 text-left font-medium">Responsável</th>
              </tr>
            </thead>
            <tbody>
              {resultado.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-3 py-8 text-center text-muted-foreground">
                    Nenhum trajeto para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                resultado.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-3 py-2 whitespace-nowrap">{formatDateBR(r.data)}</td>
                    <td className="px-3 py-2">{r.motorista}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{r.placa_veiculo}</td>
                    <td className="px-3 py-2">{r.rota_descricao}</td>
                    <td className="px-3 py-2">{r.destino_principal}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{formatTime(r.horario_saida)}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{formatTime(r.horario_retorno)}</td>
                    <td className="px-3 py-2">{r.qtd_passageiros}</td>
                    <td className="px-3 py-2">
                      <Badge className={getStatusClasses(r.status)}>{r.status}</Badge>
                    </td>
                    <td className="px-3 py-2">{r.responsavel_solicitacao}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
