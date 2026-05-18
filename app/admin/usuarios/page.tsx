'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Usuario = {
  id: string
  nome: string
  email: string
  perfil: string
  status: string
  criado_em: string
}

const perfis = ['admin', 'professor', 'coordenador']

export default function GerenciarUsuarios() {
  const router = useRouter()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState<string | null>(null)

  useEffect(() => {
    verificarAdmin()
  }, [])

  const verificarAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: usuario } = await supabase
      .from('usuarios')
      .select('perfil, status')
      .eq('id', user.id)
      .single()

    if (!usuario || usuario.perfil !== 'admin') {
      router.push('/')
      return
    }

    carregar()
  }

  const carregar = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('usuarios')
      .select('*')
      .order('criado_em', { ascending: false })
    setUsuarios(data || [])
    setLoading(false)
  }

  const atualizar = async (id: string, campos: Partial<Usuario>) => {
    setSalvando(id)
    await supabase.from('usuarios').update(campos).eq('id', id)
    setSalvando(null)
    carregar()
  }

  const aprovar = (u: Usuario) => atualizar(u.id, { status: 'ativo', perfil: u.perfil === 'pendente' ? 'professor' : u.perfil })
  const inativar = (id: string) => atualizar(id, { status: 'inativo' })
  const reativar = (id: string) => atualizar(id, { status: 'ativo' })

  const pendentes = usuarios.filter(u => u.status === 'pendente')
  const ativos = usuarios.filter(u => u.status === 'ativo')
  const inativos = usuarios.filter(u => u.status === 'inativo')

  const badgeStatus: Record<string, string> = {
    pendente: 'bg-yellow-100 text-yellow-700',
    ativo: 'bg-green-100 text-green-700',
    inativo: 'bg-gray-100 text-gray-500',
  }

  const badgePerfil: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-700',
    professor: 'bg-blue-100 text-blue-700',
    coordenador: 'bg-teal-100 text-teal-700',
    pendente: 'bg-yellow-100 text-yellow-700',
  }

  const TabelaUsuarios = ({ lista, titulo }: { lista: Usuario[], titulo: string }) => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h2 className="font-semibold text-gray-700">{titulo}</h2>
        <span className="text-sm text-gray-400">{lista.length} usuário(s)</span>
      </div>
      {lista.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-8">Nenhum usuário nesta categoria.</p>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Nome</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">E-mail</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Perfil</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Cadastro</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {lista.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{u.nome}</td>
                <td className="px-4 py-3 text-gray-500">{u.email}</td>
                <td className="px-4 py-3">
                  <select
                    value={u.perfil}
                    disabled={u.status === 'pendente'}
                    onChange={(e) => atualizar(u.id, { perfil: e.target.value })}
                    className={`text-xs px-2 py-1 rounded-full border-0 font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 ${badgePerfil[u.perfil] || ''}`}
                  >
                    {perfis.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeStatus[u.status]}`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {new Date(u.criado_em).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {u.status === 'pendente' && (
                      <button
                        onClick={() => aprovar(u)}
                        disabled={salvando === u.id}
                        className="text-green-600 hover:underline text-xs font-medium disabled:opacity-50"
                      >
                        Aprovar
                      </button>
                    )}
                    {u.status === 'ativo' && (
                      <button
                        onClick={() => inativar(u.id)}
                        disabled={salvando === u.id}
                        className="text-red-400 hover:text-red-600 text-xs disabled:opacity-50"
                      >
                        Desativar
                      </button>
                    )}
                    {u.status === 'inativo' && (
                      <button
                        onClick={() => reativar(u.id)}
                        disabled={salvando === u.id}
                        className="text-blue-600 hover:underline text-xs disabled:opacity-50"
                      >
                        Reativar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-blue-700 text-white px-6 py-4 shadow">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="text-blue-200 hover:text-white text-sm">
              ← Início
            </button>
            <div>
              <h1 className="text-xl font-semibold">Gerenciar Usuários</h1>
              <p className="text-blue-200 text-sm">{usuarios.length} usuário(s) no sistema</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {loading ? (
          <p className="text-gray-500 text-center py-10">Carregando...</p>
        ) : (
          <>
            {pendentes.length > 0 && (
              <TabelaUsuarios lista={pendentes} titulo="⏳ Aguardando aprovação" />
            )}
            <TabelaUsuarios lista={ativos} titulo="✅ Usuários ativos" />
            {inativos.length > 0 && (
              <TabelaUsuarios lista={inativos} titulo="🚫 Usuários inativos" />
            )}
          </>
        )}
      </div>
    </main>
  )
}