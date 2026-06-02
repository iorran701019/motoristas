import { useMemo } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { EventClickArg, EventInput } from '@fullcalendar/core'
import ptBrLocale from '@fullcalendar/core/locales/pt-br'
import { formatTime, getCalendarStatusColors } from '@/lib/utils'
import type { RotaMotorista } from '@/types/rota'

interface RotasCalendarProps {
  rotas: RotaMotorista[]
  onEventClick: (rota: RotaMotorista) => void
  activeMotorista?: string
}

/** Converte registro de rota em evento FullCalendar */
function rotaToEvent(rota: RotaMotorista): EventInput {
  const start = `${rota.data}T${rota.horario_saida}`
  const end = `${rota.data}T${rota.horario_retorno}`
  const colors = getCalendarStatusColors(rota.status)

  return {
    id: rota.id,
    title: `${rota.motorista} → ${rota.destino_principal}`,
    start,
    end,
    extendedProps: { rota },
    backgroundColor: colors.bg,
    borderColor: colors.border,
  }
}

/** Agenda estilo Google Calendar com visões dia/semana/mês */
export function RotasCalendar({ rotas, onEventClick, activeMotorista }: RotasCalendarProps) {
  const events = useMemo(() => rotas.map(rotaToEvent), [rotas])

  const handleEventClick = (info: EventClickArg) => {
    const rota = info.event.extendedProps.rota as RotaMotorista
    if (rota) onEventClick(rota)
  }

  return (
    <div className="rounded-lg border bg-white p-2 md:p-4">
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

          return (
            <div className={`overflow-hidden px-1 py-0.5 text-xs leading-tight ${isActive ? '' : 'opacity-60'}`}>
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
