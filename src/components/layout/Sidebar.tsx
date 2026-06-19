import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  ShieldCheck,
  Bus,
  FileText,
  LayoutDashboard,
  Route,
  Users,
  X,
  LogOut,
  Lock,
  LockOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

interface SidebarProps {
  open: boolean
  onClose: () => void
  /** Travado = sempre expandido; destravado = recolhido com expansão no hover (desktop) */
  locked: boolean
  onToggleLock: () => void
}

/** Barra lateral de navegação — responsiva com overlay em mobile */
export function Sidebar({ open, onClose, locked, onToggleLock }: SidebarProps) {
  const { isAdmin, signOut } = useAuth()
  /** Hover só importa no desktop quando destravado; expande o menu por cima do conteúdo */
  const [hovered, setHovered] = useState(false)
  const expanded = locked || hovered
  const lockLabel = locked ? 'Destravar menu' : 'Travar menu'
  const navItems = [
    { to: '/', label: 'Cadastro de Rotas', icon: Route },
    { to: '/dashboard', label: 'Painel', icon: LayoutDashboard },
    { to: '/cadastros', label: 'Motoristas e Veículos', icon: Users },
    { to: '/relatorio', label: 'Relatórios', icon: FileText },
    ...(isAdmin ? [{ to: '/admin', label: 'Administração', icon: ShieldCheck }] : []),
  ]

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-institucional-800 text-white shadow-xl transition-[transform,width] duration-300 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
          expanded ? 'lg:w-64' : 'lg:w-16'
        )}
      >
        <div
          className={cn(
            'flex h-16 items-center justify-between border-b border-institucional-700 px-4',
            !expanded && 'lg:justify-center lg:px-0'
          )}
        >
          <div className="flex items-center gap-2">
            <Bus className="h-7 w-7 shrink-0 text-institucional-300" />
            <div className={cn(!expanded && 'lg:hidden')}>
              <p className="text-xs text-institucional-300">SME</p>
              <p className="text-sm font-semibold leading-tight">Rotas Motoristas</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 hover:bg-institucional-700 lg:hidden"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              title={!expanded ? label : undefined}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  !expanded && 'lg:justify-center lg:px-0',
                  isActive
                    ? 'bg-institucional-600 text-white'
                    : 'text-institucional-200 hover:bg-institucional-700 hover:text-white'
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className={cn(!expanded && 'lg:hidden')}>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-institucional-700 p-4">
          {/* Cadeado — trava/destrava a retração no hover (somente desktop) */}
          <button
            type="button"
            onClick={onToggleLock}
            aria-label={lockLabel}
            title={lockLabel}
            className={cn(
              'mb-3 hidden w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-institucional-200 transition-colors hover:bg-institucional-700 hover:text-white lg:flex',
              !expanded && 'lg:justify-center lg:px-0'
            )}
          >
            {locked ? (
              <Lock className="h-5 w-5 shrink-0" />
            ) : (
              <LockOpen className="h-5 w-5 shrink-0" />
            )}
            <span className={cn(!expanded && 'lg:hidden')}>{lockLabel}</span>
          </button>

          <p className={cn('text-xs text-institucional-400', !expanded && 'lg:hidden')}>
            Secretaria Municipal de Educação
          </p>
          <p className={cn('mt-1 text-xs text-institucional-500', !expanded && 'lg:hidden')}>
            v1.0 — MVP
          </p>

          {/* Botão de logout — visível apenas no mobile (no desktop o Header já tem) */}
          <Button
            variant="ghost"
            onClick={() => {
              signOut()
              onClose()
            }}
            className="mt-3 w-full justify-start gap-3 text-institucional-200 hover:bg-institucional-700 hover:text-white lg:hidden"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            Sair
          </Button>
        </div>
      </aside>
    </>
  )
}
