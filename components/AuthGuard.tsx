'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const rotasPublicas = ['/login', '/cadastro']

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [verificando, setVerificando] = useState(true)
  const [autenticado, setAutenticado] = useState(false)

  useEffect(() => {
    if (rotasPublicas.includes(pathname)) {
      setVerificando(false)
      return
    }

    // Escuta mudanças de sessão — mais confiável que getSession em produção
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setAutenticado(true)
        setVerificando(false)
      } else if (event === 'SIGNED_OUT' || event === 'INITIAL_SESSION') {
        setAutenticado(false)
        setVerificando(false)
        if (!rotasPublicas.includes(pathname)) {
          router.push('/login')
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [pathname, router])

  if (rotasPublicas.includes(pathname)) {
    return <>{children}</>
  }

  if (verificando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-400 text-sm">Carregando...</p>
      </div>
    )
  }

  if (!autenticado) {
    return null
  }

  return <>{children}</>
}