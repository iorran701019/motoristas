import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

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
