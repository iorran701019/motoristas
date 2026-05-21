import { NavLink } from 'react-router-dom'
import {
  Bus,
  LayoutDashboard,
  Route,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

const navItems = [
  { to: '/', label: 'Cadastro de Rotas', icon: Route },
  { to: '/dashboard', label: 'Painel / Dashboard', icon: LayoutDashboard },
]

/** Barra lateral de navegação — responsiva com overlay em mobile */
export function Sidebar({ open, onClose }: SidebarProps) {
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
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-institucional-800 text-white shadow-xl transition-transform duration-300 lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-institucional-700 px-4">
          <div className="flex items-center gap-2">
            <Bus className="h-7 w-7 text-institucional-300" />
            <div>
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
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-institucional-600 text-white'
                    : 'text-institucional-200 hover:bg-institucional-700 hover:text-white'
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-institucional-700 p-4">
          <p className="text-xs text-institucional-400">
            Secretaria Municipal de Educação
          </p>
          <p className="mt-1 text-xs text-institucional-500">v1.0 — MVP</p>
        </div>
      </aside>
    </>
  )
}
