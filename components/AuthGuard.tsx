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

    let redirecionarTimeout: ReturnType<typeof setTimeout>

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      clearTimeout(redirecionarTimeout)

      if (session) {
        setAutenticado(true)
        setVerificando(false)
      } else {
        // Aguarda 800ms antes de redirecionar — dá tempo do localStorage carregar
        redirecionarTimeout = setTimeout(() => {
          setAutenticado(false)
          setVerificando(false)
          router.push('/login')
        }, 800)
      }
    })

    // Timeout de segurança — se onAuthStateChange não disparar em 3s, redireciona
    const timeoutSeguranca = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
      }
      setVerificando(false)
    }, 3000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(redirecionarTimeout)
      clearTimeout(timeoutSeguranca)
    }
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