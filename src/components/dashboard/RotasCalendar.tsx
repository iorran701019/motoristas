import { useMemo } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { EventClickArg, EventInput } from '@fullcalendar/core'
import ptBrLocale from '@fullcalendar/core/locales/pt-br'
import { formatTime } from '@/lib/utils'
import { getDriverColor, getDriverBorderColor, getDriverTextColor } from '@/lib/driverColor'
import { useCadastrosContext } from '@/context/CadastrosContext'
import type { RotaMotorista } from '@/types/rota'

interface RotasCalendarProps {
  rotas: RotaMotorista[]
  onEventClick: (rota: RotaMotorista) => void
  activeMotorista?: string
}

/** Converte registro de rota em evento FullCalendar (idx = ordem de cadastro do motorista) */
function rotaToEvent(rota: RotaMotorista, idx: number): EventInput {
  const start = `${rota.data}T${rota.horario_saida}`
  const end = `${rota.data}T${rota.horario_retorno}`
  const driverColor = getDriverColor(idx)

  return {
    id: rota.id,
    title: `${rota.motorista} → ${rota.destino_principal}`,
    start,
    end,
    extendedProps: { rota },
    backgroundColor: driverColor, // cor única e estável por motorista
    borderColor: driverColor,     // borda do evento = fundo (neutra)
    textColor: getDriverTextColor(),
  }
}

/** Agenda estilo Google Calendar com visões dia/semana/mês */
export function RotasCalendar({ rotas, onEventClick, activeMotorista }: RotasCalendarProps) {
  const { motoristas, setores } = useCadastrosContext()

  // Índice estável por ordem de CADASTRO (created_at): motorista novo pega a próxima cor
  const motoristaIndex = useMemo(() => {
    const ordenados = [...motoristas].sort((a, b) =>
      a.created_at < b.created_at ? -1 : a.created_at > b.created_at ? 1 : 0
    )
    const map = new Map<string, number>()
    ordenados.forEach((m, i) => map.set(m.nome_completo, i))
    return map
  }, [motoristas])

  // Lookup de cor por setor (não copiamos a cor na rota: a cor mora só em setores_sme)
  const setorCorById = useMemo(
    () => new Map(setores.map((s) => [s.id, s.cor])),
    [setores]
  )

  const events = useMemo(
    () => rotas.map((r) => rotaToEvent(r, motoristaIndex.get(r.motorista) ?? -1)),
    [rotas, motoristaIndex]
  )

  const handleEventClick = (info: EventClickArg) => {
    const rota = info.event.extendedProps.rota as RotaMotorista
    if (rota) onEventClick(rota)
  }

  return (
    <div className="rotas-calendar rounded-lg border bg-white p-2 md:p-4">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale={ptBrLocale}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        buttonText={{
          today: 'Hoje',
          month: 'Mês',
          week: 'Semana',
          day: 'Dia',
        }}
        events={events}
        eventDisplay="block"
        eventClick={handleEventClick}
        height="auto"
        contentHeight={560}
        slotMinTime="06:00:00"
        slotMaxTime="22:00:00"
        allDaySlot={false}
        nowIndicator
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }}
        eventContent={(arg) => {
          const rota = arg.event.extendedProps.rota as RotaMotorista | undefined
          if (!rota) return null

          const isActive =
            activeMotorista === undefined ||
            activeMotorista === 'todos' ||
            rota.motorista === activeMotorista

          // Barra lateral = cor do setor (lookup por setor_id; fundo segue por motorista).
          // Fallback para o tom escuro do motorista se o setor ainda não carregou.
          const idx = motoristaIndex.get(rota.motorista) ?? -1
          const barColor = setorCorById.get(rota.setor_id) ?? getDriverBorderColor(idx)

          return (
            <div
              className={`overflow-hidden py-0.5 pl-1.5 pr-1 text-xs leading-tight ${isActive ? '' : 'opacity-60'}`}
              style={{ borderLeft: `4px solid ${barColor}`, color: getDriverTextColor() }}
            >
              <div className="font-semibold truncate">{rota.motorista}</div>
              <div className="truncate opacity-90">{rota.destino_principal}</div>
              <div className="truncate opacity-75">
                {formatTime(rota.horario_saida)} – {formatTime(rota.horario_retorno)}
              </div>
            </div>
          )
        }}
      />
    </div>
  )
}
