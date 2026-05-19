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
    if (rotasPublicas.includes(pathname)) {
      setVerificando(false)
      return
    }

    const verificar = async () => {
      // Tenta até 3 vezes com intervalo — dá tempo do localStorage inicializar
      for (let i = 0; i < 3; i++) {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          setVerificando(false)
          return
        }
        // Aguarda 300ms entre tentativas
        await new Promise((r) => setTimeout(r, 300))
      }
      // Após 3 tentativas sem sessão, redireciona
      router.push('/login')
    }

    verificar()
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

  return <>{children}</>
}