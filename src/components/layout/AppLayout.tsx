import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { cn } from '@/lib/utils'

const SIDEBAR_LOCKED_KEY = 'sidebar_locked'

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/': {
    title: 'Cadastro de Rotas',
    subtitle: 'Registre as rotas realizadas pelos motoristas',
  },
  '/dashboard': {
    title: 'Painel Administrativo',
    subtitle: 'Agenda de rotas no topo e histórico abaixo',
  },
  '/cadastros': {
    title: 'Motoristas e Veículos',
    subtitle: 'Cadastre motoristas e veículos usados nas rotas',
  },
  '/relatorio': {
    title: 'Relatórios',
    subtitle: 'Gere e imprima o histórico de trajetos por período e status',
  },
  '/admin': {
    title: 'Administração',
    subtitle: 'Gestão de usuários e senhas do sistema',
  },
}

/** Layout principal: sidebar + header + conteúdo */
export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [locked, setLocked] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true
    const stored = localStorage.getItem(SIDEBAR_LOCKED_KEY)
    return stored === null ? true : stored === 'true'
  })
  const location = useLocation()
  const meta = pageTitles[location.pathname] ?? {
    title: 'Rotas Motoristas',
    subtitle: '',
  }

  const toggleLock = () => {
    setLocked((prev) => {
      const next = !prev
      localStorage.setItem(SIDEBAR_LOCKED_KEY, String(next))
      return next
    })
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        locked={locked}
        onToggleLock={toggleLock}
      />

      {/* A margem do conteúdo reage só ao `locked` (w-64 travado / w-16 destravado);
          no hover o menu expande POR CIMA do conteúdo, sem empurrar — evita "pulo" */}
      <div
        className={cn(
          'flex flex-1 flex-col transition-[margin] duration-300',
          locked ? 'lg:ml-64' : 'lg:ml-16'
        )}
      >
        <Header
          title={meta.title}
          subtitle={meta.subtitle}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
