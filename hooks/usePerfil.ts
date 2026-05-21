'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export type Perfil = 'admin' | 'professor' | null

export type Usuario = {
  id: string
  nome: string
  perfil: Perfil
  professor_id: string | null
}

export function usePerfil() {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const carregar = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setLoading(false); return }

      const { data } = await supabase
        .from('usuarios')
        .select('id, nome, perfil, professor_id')
        .eq('id', session.user.id)
        .single()

      if (data) setUsuario(data as Usuario)
      setLoading(false)
    }
    carregar()
  }, [])

  const isAdmin = usuario?.perfil === 'admin'
  const isProfessor = usuario?.perfil === 'professor'

  return { usuario, loading, isAdmin, isProfessor }
}