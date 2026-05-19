'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const rotasPublicas = ['/login', '/cadastro']

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [verificando, setVerificando] = useState(true)

  useEffect(() => {
    const verificar = async () => {
      if (rotasPublicas.includes(pathname)) {
        setVerificando(false)
        return
      }

      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      setVerificando(false)
    }

    verificar()

    // Escuta mudanças de sessão
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || (!session && !rotasPublicas.includes(pathname))) {
        router.push('/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [pathname, router])

  if (verificando && !rotasPublicas.includes(pathname)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-400 text-sm">Carregando...</p>
      </div>
    )
  }

  return <>{children}</>
}