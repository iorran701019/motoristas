import { Bus, Calendar, Route, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { DashboardStats } from '@/types/rota'

interface StatsCardsProps {
  stats: DashboardStats
  loading?: boolean
}

const cards = [
  {
    key: 'totalRotas' as const,
    label: 'Total de Rotas',
    icon: Route,
    color: 'bg-blue-100 text-blue-700',
  },
  {
    key: 'totalMotoristas' as const,
    label: 'Total de Motoristas',
    icon: Users,
    color: 'bg-indigo-100 text-indigo-700',
  },
  {
    key: 'rotasHoje' as const,
    label: 'Rotas do Dia',
    icon: Calendar,
    color: 'bg-amber-100 text-amber-700',
  },
  {
    key: 'totalPassageiros' as const,
    label: 'Passageiros Transportados',
    icon: Bus,
    color: 'bg-emerald-100 text-emerald-700',
  },
]

/** Cards de resumo do dashboard */
export function StatsCards({ stats, loading }: StatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ key, label, icon: Icon, color }) => (
        <Card key={key} className="overflow-hidden">
          <CardContent className="flex items-center gap-4 p-5">
            <div className={`rounded-lg p-3 ${color}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-2xl font-bold text-institucional-800">
                {loading ? '—' : stats[key].toLocaleString('pt-BR')}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
