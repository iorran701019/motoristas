import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { RotasCalendar } from '@/components/dashboard/RotasCalendar'
import { RotaDetailModal } from '@/components/dashboard/RotaDetailModal'
import { RotasTable } from '@/components/dashboard/RotasTable'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { useRotasContext } from '@/context/RotasContext'
import type { RotaMotorista } from '@/types/rota'

/** Tela 2 — Painel / Dashboard */
export function DashboardPage() {
  const { rotas, stats, loading, error } = useRotasContext()
  const [selectedRota, setSelectedRota] = useState<RotaMotorista | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const openDetail = (rota: RotaMotorista) => {
    setSelectedRota(rota)
    setModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Erro ao carregar dados: {error}</span>
        </div>
      )}

      <StatsCards stats={stats} loading={loading} />

      <RotasTable rotas={rotas} onRowClick={openDetail} />

      <RotasCalendar rotas={rotas} onEventClick={openDetail} />

      <RotaDetailModal
        rota={selectedRota}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  )
}
