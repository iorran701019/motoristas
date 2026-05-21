'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const rotasPublicas = ['/login', '/cadastro']

// Rotas que só admin pode acessar
const rotasAdmin = [
  '/admin',
  '/professores',
  '/cuidadores',
  '/responsaveis',
  '/escolas',
]

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [autorizado, setAutorizado] = useState(false)

  useEffect(() => {
    const verificar = async () => {
      // Rotas públicas: libera direto
      if (rotasPublicas.includes(pathname)) {
        setAutorizado(true)
        setLoading(false)
        return
      }

      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.replace('/login')
        return
      }

      const { data: usuario } = await supabase
        .from('usuarios')
        .select('perfil, status')
        .eq('id', session.user.id)
        .single()

      // Usuário pendente ou inativo
      if (!usuario || usuario.status === 'pendente' || usuario.status === 'inativo') {
        await supabase.auth.signOut()
        router.replace('/login')
        return
      }

      // Professor tentando acessar rota de admin
      if (usuario.perfil === 'professor') {
        const bloqueada = rotasAdmin.some((rota) => pathname.startsWith(rota))
        if (bloqueada) {
          router.replace('/')
          return
        }
      }

      setAutorizado(true)
      setLoading(false)
    }

    verificar()
  }, [pathname, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Carregando...</p>
      </div>
    )
  }

  if (!autorizado) return null

  return <>{children}</>
}