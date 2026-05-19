'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Escola = { id: string; nome: string }

export default function ListaAlunos() {
  const router = useRouter()
  const [alunos, setAlunos] = useState<any[]>([])
  const [escolas, setEscolas] = useState<Escola[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtroEscola, setFiltroEscola] = useState('')
  const [confirmando, setConfirmando] = useState<string | null>(null)

  useEffect(() => {
    buscarAlunos()
    buscarEscolas()
  }, [])

  const buscarEscolas = async () => {
    const { data } = await supabase.from('escolas').select('id, nome').eq('ativo', true).order('nome')
    setEscolas(data || [])
  }

  const buscarAlunos = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('alunos')
      .select('*, escolas(nome)')
      .eq('ativo', true)
      .order('nome')
    if (error) console.error(error)
    setAlunos(data || [])
    setLoading(false)
  }

  const desativar = async (id: string) => {
    await supabase.from('alunos').update({ ativo: false }).eq('id', id)
    setConfirmando(null)
    buscarAlunos()
  }

  const filtrados = alunos.filter((a: any) => {
    const matchBusca =
      a.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      a.numero_matricula?.includes(busca) ||
      a.tipo_deficiencia?.toLowerCase().includes(busca.toLowerCase())
    const matchEscola = filtroEscola ? a.escola_id === filtroEscola : true
    return matchBusca && matchEscola
  })

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-blue-700 text-white px-6 py-4 shadow">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="text-blue-200 hover:text-white text-sm">
              ← Início
            </button>
            <div>
              <h1 className="text-xl font-semibold">Alunos</h1>
              <p className="text-blue-200 text-sm">{alunos.length} aluno(s) cadastrado(s)</p>
            </div>
          </div>
          <Link
            href="/alunos/novo"
            className="bg-white text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50"
          >
            + Novo aluno
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Buscar por nome, matrícula ou deficiência..."
            value={busca}
            onChange={(e: any) => setBusca(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <select
            value={filtroEscola}
            onChange={(e: any) => setFiltroEscola(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Todas as escolas</option>
            {escolas.map((e) => (
              <option key={e.id} value={e.id}>{e.nome}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-gray-500 text-center py-10">Carregando...</p>
        ) : filtrados.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg mb-2">Nenhum aluno encontrado</p>
            <Link href="/alunos/novo" className="text-blue-600 text-sm hover:underline">
              Cadastrar primeiro aluno
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Nome</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Matrícula</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Deficiência</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Escola</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Laudo</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtrados.map((aluno: any) => (
                  <tr key={aluno.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{aluno.nome}</td>
                    <td className="px-4 py-3 text-gray-500">{aluno.numero_matricula}</td>
                    <td className="px-4 py-3">
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                        {aluno.tipo_deficiencia}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{aluno.escolas?.nome || '—'}</td>
                    <td className="px-4 py-3">
                      {aluno.tem_laudo ? (
                        <span className="text-green-600 text-xs font-medium">✓ Sim</span>
                      ) : (
                        <span className="text-gray-400 text-xs">Não</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Link href={`/alunos/${aluno.id}`} className="text-blue-600 hover:underline text-xs">
                          Ver perfil
                        </Link>
                        <Link href={`/alunos/${aluno.id}/editar`} className="text-gray-500 hover:text-gray-700 hover:underline text-xs">
                          Editar
                        </Link>
                        {confirmando === aluno.id ? (
                          <span className="flex items-center gap-1">
                            <button onClick={() => desativar(aluno.id)} className="text-red-600 text-xs font-medium hover:underline">Confirmar</button>
                            <span className="text-gray-300">|</span>
                            <button onClick={() => setConfirmando(null)} className="text-gray-400 text-xs hover:underline">Cancelar</button>
                          </span>
                        ) : (
                          <button onClick={() => setConfirmando(aluno.id)} className="text-red-400 hover:text-red-600 text-xs">
                            Desativar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}