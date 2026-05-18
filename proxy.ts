import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {

  const pathname = request.nextUrl.pathname

  // libera login
  if (pathname === '/login') {
    return NextResponse.next()
  }

  const token =
    request.cookies.get('sb-access-token')?.value ||
    request.cookies.get('supabase-auth-token')?.value

  // protege rotas privadas
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/alunos') ||
    pathname.startsWith('/professores') ||
    pathname.startsWith('/escolas') ||
    pathname.startsWith('/atendimentos') ||
    pathname.startsWith('/responsaveis') ||
    pathname.startsWith('/cuidadores') ||
    pathname.startsWith('/horarios') ||
    pathname.startsWith('/relatorios')
  ) {

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/alunos/:path*',
    '/professores/:path*',
    '/escolas/:path*',
    '/atendimentos/:path*',
    '/responsaveis/:path*',
    '/cuidadores/:path*',
    '/horarios/:path*',
    '/relatorios/:path*'
  ]
}