import { LogOut, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'

interface HeaderProps {
  title: string
  subtitle?: string
  onMenuClick: () => void
}

/** Cabeçalho superior com título da página atual */
export function Header({ title, subtitle, onMenuClick }: HeaderProps) {
  const { signOut, user } = useAuth()

  // Nome a exibir no canto: 1º nome do user_metadata.nome_completo (gravado no
  // cadastro). Sem query a app_user_profiles — só o que já vem no AuthContext.
  // Fallback p/ usuários antigos sem metadata: parte do e-mail antes do @.
  const nomeCompleto = (user?.user_metadata?.nome_completo as string | undefined)?.trim()
  const rawName = nomeCompleto ? nomeCompleto.split(/\s+/)[0] : user?.email?.split('@')[0] ?? ''
  // Capitaliza a inicial do valor final ('gustavo' → 'Gustavo'), seja nome ou e-mail.
  const displayName = rawName ? rawName.charAt(0).toUpperCase() + rawName.slice(1) : ''

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-4 shadow-sm lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1">
        <h1 className="text-lg font-semibold text-institucional-800">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <div className="hidden items-center gap-2 sm:flex">
        <span
          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
          title={user?.email}
        >
          {displayName}
        </span>
        <span className="rounded-full bg-institucional-100 px-3 py-1 text-xs font-medium text-institucional-700">
          Acesso interno
        </span>
        <Button variant="outline" size="sm" onClick={signOut}>
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </header>
  )
}
