import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { RotaStatus } from '@/types/rota'

/** Combina classes Tailwind sem conflitos (padrão shadcn/ui) */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Formata data ISO (YYYY-MM-DD) para exibição pt-BR */
export function formatDateBR(dateStr: string): string {
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

/** Formata horário TIME (HH:MM:SS ou HH:MM) para exibição */
export function formatTime(timeStr: string): string {
  return timeStr.slice(0, 5)
}

/** Retorna data de hoje no formato YYYY-MM-DD */
export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Verifica se dois intervalos de horário se sobrepõem.
 * Aceita "HH:MM" ou "HH:MM:SS" (normaliza para HH:MM). Horários encostados
 * (um termina quando o outro começa) NÃO contam como conflito.
 */
export function intervalosSobrepoem(
  iniA: string,
  fimA: string,
  iniB: string,
  fimB: string
): boolean {
  const n = (t: string) => t.slice(0, 5)
  return n(iniA) < n(fimB) && n(iniB) < n(fimA)
}

export function getStatusClasses(status: RotaStatus): string {
  switch (status) {
    case 'Concluída':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    case 'Cancelada':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'Adiada':
      return 'bg-amber-100 text-amber-800 border-amber-200'
    case 'Agendada':
    default:
      return 'bg-blue-100 text-blue-800 border-blue-200'
  }
}

export function getCalendarStatusColors(status: RotaStatus): { bg: string; border: string } {
  switch (status) {
    case 'Concluída':
      return { bg: '#10b981', border: '#047857' }
    case 'Cancelada':
      return { bg: '#ef4444', border: '#b91c1c' }
    case 'Adiada':
      return { bg: '#f59e0b', border: '#b45309' }
    case 'Agendada':
    default:
      return { bg: '#3b82f6', border: '#1d4ed8' }
  }
}
