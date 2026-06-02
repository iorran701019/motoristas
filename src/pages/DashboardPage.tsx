import { useMemo, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { RotasCalendar } from '@/components/dashboard/RotasCalendar'
import { RotaDetailModal } from '@/components/dashboard/RotaDetailModal'
import { RotasTable } from '@/components/dashboard/RotasTable'
import { SupabaseConfigAlert } from '@/components/SupabaseConfigAlert'
import { useRotasContext } from '@/context/RotasContext'
import { getSupabaseConfig } from '@/lib/supabase-config'
import type { RotaMotorista } from '@/types/rota'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

/** Tela 2 — Painel / Dashboard */
export function DashboardPage() {
  const { rotas, error } = useRotasContext()
  const [selectedRota, setSelectedRota] = useState<RotaMotorista | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [motoristaFilter, setMotoristaFilter] = useState('todos')

  const openDetail = (rota: RotaMotorista) => {
    setSelectedRota(rota)
    setModalOpen(true)
  }

  const configOk = getSupabaseConfig().isConfigured
  const motoristas = useMemo(
    () => Array.from(new Set(rotas.map((r) => r.motorista))).sort(),
    [rotas]
  )

  const filteredRotas = useMemo(
    () =>
      rotas.filter((rota) => {
        if (motoristaFilter !== 'todos' && rota.motorista !== motoristaFilter) return false
        return true
      }),
    [rotas, motoristaFilter]
  )

  return (
    <div className="space-y-6">
      <SupabaseConfigAlert />

      {error && configOk && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Erro ao carregar dados: {error}</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Agenda de Rotas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Select value={motoristaFilter} onValueChange={setMotoristaFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por motorista" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os motoristas</SelectItem>
                {motoristas.map((motorista) => (
                  <SelectItem key={motorista} value={motorista}>
                    {motorista}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted-foreground">Legenda de status:</span>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">Agendada</Badge>
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Concluída</Badge>
            <Badge className="bg-red-100 text-red-800 border-red-200">Cancelada</Badge>
            <Badge className="bg-amber-100 text-amber-800 border-amber-200">Adiada</Badge>
          </div>

          <RotasCalendar
            rotas={filteredRotas}
            onEventClick={openDetail}
            activeMotorista={motoristaFilter}
          />
        </CardContent>
      </Card>

      <RotasTable rotas={filteredRotas} onRowClick={openDetail} />

      <RotaDetailModal
        rota={selectedRota}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  )
}
