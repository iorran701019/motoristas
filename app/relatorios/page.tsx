'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { usePerfil } from '@/hooks/usePerfil'

export default function Relatorios() {
  const router = useRouter()
  const { usuario, loading: loadingPerfil, isAdmin, isProfessor } = usePerfil()
  const [frequencia, setFrequencia] = useState<any[]>([])
  const [escolas, setEscolas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroAluno, setFiltroAluno] = useState('')
  const [filtroEscola, setFiltroEscola] = useState('')

  useEffect(() => {
    if (!loadingPerfil && usuario) {
      carregar()
      if (isAdmin) buscarEscolas()
    }
  }, [loadingPerfil, usuario])

  const buscarEscolas = async () => {
    const { data } = await supabase.from('escolas').select('id, nome').eq('ativo', true).order('nome')
    setEscolas(data || [])
  }

  const carregar = async () => {
    setLoading(true)

    if (isProfessor && usuario?.professor_id) {
      // Busca só os alunos vinculados ao professor
      const { data: horarios } = await supabase
        .from('horarios_atendimento')
        .select('aluno_id')
        .eq('professor_id', usuario.professor_id)
        .eq('ativo', true)

      const alunoIds = [...new Set((horarios || []).map((h: any) => h.aluno_id))]

      if (alunoIds.length === 0) {
        setFrequencia([])
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('vw_frequencia_alunos')
        .select('*')
        .in('aluno_id', alunoIds)
        .order('aluno')

      setFrequencia(data || [])
    } else {
      const { data } = await supabase
        .from('vw_frequencia_alunos')
        .select('*')
        .order('aluno')

      setFrequencia(data || [])
    }

    setLoading(false)
  }

  const filtrados = frequencia.filter((f) => {
    const matchAluno = f.aluno?.toLowerCase().includes(filtroAluno.toLowerCase())
    const matchEscola = filtroEscola ? f.escola === filtroEscola : true
    return matchAluno && matchEscola
  })

  if (loadingPerfil) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Carregando...</p></div>

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-blue-700 text-white px-6 py-4 shadow print:hidden">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="text-blue-200 hover:text-white text-sm">← Início</button>
            <div>
              <h1 className="text-xl font-semibold">Relatórios</h1>
              <p className="text-blue-200 text-sm">{isProfessor ? 'Frequência dos meus alunos' : 'Frequência e acompanhamento'}</p>
            </div>
          </div>
          <button onClick={() => window.print()} className="bg-white text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50">
            🖨️ Imprimir
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="print:hidden mb-4 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Filtrar por nome do aluno..."
            value={filtroAluno}
            onChange={(e) => setFiltroAluno(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {isAdmin && (
            <select
              value={filtroEscola}
              onChange={(e) => setFiltroEscola(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Todas as escolas</option>
              {escolas.map((e: any) => <option key={e.id} value={e.nome}>{e.nome}</option>)}
            </select>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-700">Frequência por aluno</h2>
            <span className="text-sm text-gray-500">{filtrados.length} aluno(s)</span>
          </div>
          {loading ? (
            <p className="text-gray-500 text-center py-10">Carregando...</p>
          ) : filtrados.length === 0 ? (
            <p className="text-center text-gray-400 py-16">Nenhum dado encontrado.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Aluno</th>
                  {isAdmin && <th className="text-left px-4 py-3 text-gray-600 font-medium">Escola</th>}
                  <th className="text-center px-4 py-3 text-gray-600 font-medium">Total</th>
                  <th className="text-center px-4 py-3 text-gray-600 font-medium">Presenças</th>
                  <th className="text-center px-4 py-3 text-gray-600 font-medium">Faltas</th>
                  <th className="text-center px-4 py-3 text-gray-600 font-medium">% Frequência</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtrados.map((f: any, i: number) => {
                  const pct = parseFloat(String(f.percentual_presenca || 0))
                  const cor = pct >= 75 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-600'
                  return (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{f.aluno}</td>
                      {isAdmin && <td className="px-4 py-3 text-gray-500">{f.escola || '—'}</td>}
                      <td className="px-4 py-3 text-center text-gray-500">{f.total_atendimentos}</td>
                      <td className="px-4 py-3 text-center text-green-600 font-medium">{f.presencas}</td>
                      <td className="px-4 py-3 text-center text-red-500">{f.faltas}</td>
                      <td className={`px-4 py-3 text-center font-semibold ${cor}`}>{pct.toFixed(1)}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  )
}