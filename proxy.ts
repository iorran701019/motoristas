import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {

  const pathname = request.nextUrl.pathname

  // libera login
  if (pathname === '/login') {
    return NextResponse.next()
  }

  // procura qualquer cookie do supabase
  const hasSupabaseCookie = request.cookies
    .getAll()
    .some(cookie => cookie.name.startsWith('sb-'))

  // rotas protegidas
  const protectedRoutes = [
    '/admin',
    '/alunos',
    '/professores',
    '/escolas',
    '/atendimentos',
    '/responsaveis',
    '/cuidadores',
    '/horarios',
    '/relatorios'
  ]

  const isProtected = protectedRoutes.some(route =>
    pathname.startsWith(route)
  )

  if (isProtected && !hasSupabaseCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
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