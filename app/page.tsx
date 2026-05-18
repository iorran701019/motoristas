'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Home() {

  const router = useRouter()

  const [perfil, setPerfil] = useState<string | null>(null)
  const [nome, setNome] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    const verificarUsuario = async () => {

      const {
        data: { session }
      } = await supabase.auth.getSession()

      // NÃO LOGADO
      if (!session) {
        router.push('/login')
        return
      }

      const user = session.user

      const { data } = await supabase
        .from('usuarios')
        .select('perfil, nome')
        .eq('id', user.id)
        .single()

      if (data) {
        setPerfil(data.perfil)
        setNome(data.nome)
      }

      setLoading(false)
    }

    verificarUsuario()

  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const modulos = [
    {
      href: '/alunos',
      icon: '🎓',
      titulo: 'Alunos',
      desc: 'Cadastro e perfil dos alunos com deficiência'
    },
    {
      href: '/professores',
      icon: '👩‍🏫',
      titulo: 'Professores AEE',
      desc: 'Cadastro dos professores de atendimento especializado'
    },
    {
      href: '/cuidadores',
      icon: '🤝',
      titulo: 'Cuidadores',
      desc: 'Auxiliares e cuidadores vinculados aos alunos'
    },
    {
      href: '/responsaveis',
      icon: '👨‍👩‍👧',
      titulo: 'Responsáveis',
      desc: 'Familiares e responsáveis pelos alunos'
    },
    {
      href: '/horarios',
      icon: '📅',
      titulo: 'Horários',
      desc: 'Agenda semanal de atendimentos AEE'
    },
    {
      href: '/atendimentos',
      icon: '📋',
      titulo: 'Atendimentos',
      desc: 'Registro de sessões, evolução e frequência'
    },
    {
      href: '/relatorios',
      icon: '📊',
      titulo: 'Relatórios',
      desc: 'Frequência, perfis e histórico de atendimentos'
    },
    {
      href: '/escolas',
      icon: '🏫',
      titulo: 'Escolas',
      desc: 'Unidades escolares cadastradas'
    },
  ]

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Carregando...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 overflow-x-hidden">

      <header className="bg-blue-700 text-white px-4 sm:px-6 py-4 shadow">

        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">

          <div>
            <h1 className="text-lg sm:text-xl font-semibold">
              Sistema de Gestão da Educação Especial
            </h1>

            <p className="text-blue-200 text-sm mt-1">

              {nome ? `Olá, ${nome}` : 'Painel principal'}

              {perfil && (
                <span className="ml-2 bg-blue-600 text-blue-100 text-xs px-2 py-0.5 rounded-full">
                  {perfil}
                </span>
              )}

            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">

            {perfil === 'admin' && (
              <Link
                href="/admin/usuarios"
                className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-3 py-2 rounded-lg text-center"
              >
                👥 Usuários
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="bg-white text-blue-700 hover:bg-blue-50 text-sm px-3 py-2 rounded-lg font-medium"
            >
              Sair
            </button>

          </div>

        </div>

      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        <h2 className="text-gray-600 text-sm font-medium uppercase tracking-wide mb-4">
          Módulos
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {modulos.map((m) => (

            <Link
              key={m.href}
              href={m.href}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-blue-300 transition-all group"
            >

              <div className="text-3xl mb-3">
                {m.icon}
              </div>

              <h3 className="font-semibold text-gray-800 group-hover:text-blue-700">
                {m.titulo}
              </h3>

              <p className="text-gray-500 text-sm mt-1 leading-snug">
                {m.desc}
              </p>

            </Link>

          ))}

        </div>

      </div>

    </main>
  )
}