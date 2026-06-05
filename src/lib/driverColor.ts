/** Paleta fixa de fundos claros (máx. 10 motoristas), legíveis com texto escuro #1a1a1a. */
export const DRIVER_PALETTE = [
  '#BFDBFE', '#BBF7D0', '#FECACA', '#FED7AA', '#DDD6FE',
  '#FEF08A', '#A5F3FC', '#FBCFE8', '#D9F99D', '#E5E7EB',
] as const

/** Tons mais escuros correspondentes (mesma ordem) para a barra lateral. */
export const DRIVER_PALETTE_DARK = [
  '#3B82F6', '#22C55E', '#EF4444', '#F97316', '#8B5CF6',
  '#EAB308', '#06B6D4', '#EC4899', '#84CC16', '#9CA3AF',
] as const

/** Módulo seguro (lida com índice -1 / negativos). */
function wrap(index: number, len: number): number {
  return ((index % len) + len) % len
}

/** Fundo claro estável por índice (ordem de cadastro). */
export function getDriverColor(index: number): string {
  return DRIVER_PALETTE[wrap(index, DRIVER_PALETTE.length)]
}

/** Cor mais escura correspondente (barra lateral), por índice. */
export function getDriverBorderColor(index: number): string {
  return DRIVER_PALETTE_DARK[wrap(index, DRIVER_PALETTE_DARK.length)]
}

/** Texto escuro para contraste sobre os fundos claros. */
export function getDriverTextColor(): string {
  return '#1a1a1a'
}
