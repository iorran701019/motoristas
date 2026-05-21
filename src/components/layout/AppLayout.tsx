import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/': {
    title: 'Cadastro de Rotas',
    subtitle: 'Registre as rotas realizadas pelos motoristas',
  },
  '/dashboard': {
    title: 'Painel Administrativo',
    subtitle: 'Visão geral, tabela e agenda de rotas',
  },
}

/** Layout principal: sidebar + header + conteúdo */
export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const meta = pageTitles[location.pathname] ?? {
    title: 'Rotas Motoristas',
    subtitle: '',
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col lg:ml-0">
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
