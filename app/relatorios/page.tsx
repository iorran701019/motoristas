'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { exportarFrequenciaAluno, exportarAtendimentosProfessor } from '@/lib/pdfExport'

type Frequencia = {
  aluno_id?: string
  aluno?: string
  escola?: string
  total_atendimentos?: number
  presencas?: number
  faltas?: number
  percentual_presenca?: string | number
}

type AtendimentoProfessor = {
  professor_id?: string
  professor?: string
  escola?: string
  aluno?: string
  data?: string
  presente?: boolean
  tipo_atendimento?: string
  evolucao?: string
  habilidades_trabalhadas?: string
}

export default function Relatorios() {
  const router = useRouter()
  const [aba, setAba] = useState<'frequencia' | 'professor'>('frequencia')

  // Frequência por aluno
  const [frequencia, setFrequencia] = useState<Frequencia[]>([])
  const [loadingFreq, setLoadingFreq] = useState(true)
  const [filtroAluno, setFiltroAluno] = useState('')
  const [exportandoAluno, setExportandoAluno] = useState<string | null>(null)

  // Atendimentos por professor
  const [atendimentos, setAtendimentos] = useState<AtendimentoProfessor[]>([])
  const [loadingProf, setLoadingProf] = useState(true)
  const [filtroProfessor, setFiltroProfessor] = useState('')
  const [professores, setProfessores] = useState<string[]>([])
  const [exportandoProf, setExportandoProf] = useState<string | null>(null)

  useEffect(() => {
    carregarFrequencia()
    carregarProfessor()
  }, [])

  const carregarFrequencia = async () => {
    setLoadingFreq(true)
    const { data } = await supabase
      .from('vw_frequencia_alunos')
      .select('*')
      .order('aluno')
    setFrequencia(data || [])
    setLoadingFreq(false)
  }

  const carregarProfessor = async () => {
    setLoadingProf(true)
    const { data } = await supabase
      .from('vw_atendimentos_professor')
      .select('*')
      .order('data', { ascending: false })
    setAtendimentos(data || [])
    const nomes = [...new Set((data || []).map((a: AtendimentoProfessor) => a.professor || ''))]
      .filter(Boolean)
      .sort()
    setProfessores(nomes)
    setLoadingProf(false)
  }

  // ── Exportar PDF: Frequência de um aluno ──────────────────────────
  const handleExportarFrequencia = async (aluno: Frequencia) => {
    if (!aluno.aluno_id) {
      alert('Este aluno não possui ID na view. Verifique se a coluna aluno_id está sendo retornada pela vw_frequencia_alunos.')
      return
    }

    setExportandoAluno(aluno.aluno_id)
    try {
      const { data: detalhes } = await supabase
        .from('atendimentos')
        .select(`
          data,
          presente,
          justificativa_falta,
          tipo_atendimento,
          evolucao,
          professores_aee ( nome )
        `)
        .eq('aluno_id', aluno.aluno_id)
        .order('data', { ascending: false })

      exportarFrequenciaAluno({
        aluno: aluno.aluno || '—',
        escola: aluno.escola || '—',
        total_atendimentos: aluno.total_atendimentos || 0,
        presencas: aluno.presencas || 0,
        faltas: aluno.faltas || 0,
        percentual_presenca: parseFloat(String(aluno.percentual_presenca || 0)),
        atendimentos: (detalhes || []).map((a: any) => ({
          data: a.data,
          presente: a.presente,
          justificativa_falta: a.justificativa_falta,
          tipo_atendimento: a.tipo_atendimento,
          evolucao: a.evolucao,
          professor: a.professores_aee?.nome,
        })),
      })
    } finally {
      setExportandoAluno(null)
    }
  }

  // ── Exportar PDF: Atendimentos de um professor ────────────────────
  const handleExportarProfessor = async (nomeProfessor: string) => {
    setExportandoProf(nomeProfessor)
    try {
      // Busca os atendimentos detalhados pelo nome (a view não expõe professor_id)
      // Se sua view tiver professor_id, troque o .eq abaixo para usar o id
      const registros = atendimentos.filter((a) => a.professor === nomeProfessor)
      const escola = registros[0]?.escola || '—'

      exportarAtendimentosProfessor({
        professor: nomeProfessor,
        escola,
        atendimentos: registros.map((a) => ({
          aluno: a.aluno || '—',
          data: a.data || '',
          presente: a.presente ?? false,
          tipo_atendimento: a.tipo_atendimento,
          evolucao: a.evolucao,
          habilidades_trabalhadas: a.habilidades_trabalhadas,
        })),
      })
    } finally {
      setExportandoProf(null)
    }
  }

  const frequenciaFiltrada = frequencia.filter((f) =>
    f.aluno?.toLowerCase().includes(filtroAluno.toLowerCase())
  )

  const atendimentosFiltrados = atendimentos.filter((a) =>
    filtroProfessor ? a.professor === filtroProfessor : true
  )

  const resumoProfessor = professores.map((prof) => {
    const registros = atendimentos.filter((a) => a.professor === prof)
    const total = registros.length
    const presencas = registros.filter((a) => a.presente).length
    const faltas = total - presencas
    const pct = total > 0 ? Math.round((presencas / total) * 100) : 0
    return { prof, total, presencas, faltas, pct }
  })

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-blue-700 text-white px-6 py-4 shadow print:hidden">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="text-blue-200 hover:text-white text-sm">
              ← Início
            </button>
            <div>
              <h1 className="text-xl font-semibold">Relatórios</h1>
              <p className="text-blue-200 text-sm">Frequência e acompanhamento</p>
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="bg-white text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50"
          >
            🖨️ Imprimir
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-6">

        {/* Abas */}
        <div className="flex gap-2 mb-6 print:hidden">
          <button
            onClick={() => setAba('frequencia')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              aba === 'frequencia'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            📊 Frequência por aluno
          </button>
          <button
            onClick={() => setAba('professor')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              aba === 'professor'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            👩‍🏫 Atendimentos por professor
          </button>
        </div>

        {/* ── Aba: Frequência por aluno ── */}
        {aba === 'frequencia' && (
          <>
            <div className="print:hidden mb-4">
              <input
                type="text"
                placeholder="Filtrar por nome do aluno..."
                value={filtroAluno}
                onChange={(e) => setFiltroAluno(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <h2 className="font-semibold text-gray-700">Frequência por aluno</h2>
                <span className="text-sm text-gray-500">{frequenciaFiltrada.length} aluno(s)</span>
              </div>

              {loadingFreq ? (
                <p className="text-gray-500 text-center py-10">Carregando...</p>
              ) : frequenciaFiltrada.length === 0 ? (
                <p className="text-center text-gray-400 py-16">Nenhum dado encontrado.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-gray-600 font-medium">Aluno</th>
                      <th className="text-left px-4 py-3 text-gray-600 font-medium">Escola</th>
                      <th className="text-center px-4 py-3 text-gray-600 font-medium">Total</th>
                      <th className="text-center px-4 py-3 text-gray-600 font-medium">Presenças</th>
                      <th className="text-center px-4 py-3 text-gray-600 font-medium">Faltas</th>
                      <th className="text-center px-4 py-3 text-gray-600 font-medium">% Frequência</th>
                      <th className="text-center px-4 py-3 text-gray-600 font-medium print:hidden">PDF</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {frequenciaFiltrada.map((f, i) => {
                      const pct = parseFloat(String(f.percentual_presenca || 0))
                      const cor = pct >= 75 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-600'
                      const exportando = exportandoAluno === f.aluno_id
                      return (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-800">{f.aluno}</td>
                          <td className="px-4 py-3 text-gray-500">{f.escola || '—'}</td>
                          <td className="px-4 py-3 text-center text-gray-500">{f.total_atendimentos}</td>
                          <td className="px-4 py-3 text-center text-green-600 font-medium">{f.presencas}</td>
                          <td className="px-4 py-3 text-center text-red-500">{f.faltas}</td>
                          <td className={`px-4 py-3 text-center font-semibold ${cor}`}>{pct.toFixed(1)}%</td>
                          <td className="px-4 py-3 text-center print:hidden">
                            <button
                              onClick={() => handleExportarFrequencia(f)}
                              disabled={exportando}
                              className="text-blue-600 hover:text-blue-800 text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                              title="Exportar PDF de frequência"
                            >
                              {exportando ? '⏳' : '⬇ PDF'}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* ── Aba: Atendimentos por professor ── */}
        {aba === 'professor' && (
          <>
            {resumoProfessor.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {resumoProfessor.map((r) => (
                  <div
                    key={r.prof}
                    className={`bg-white rounded-xl border p-4 transition-all ${
                      filtroProfessor === r.prof
                        ? 'border-blue-400 shadow-md'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {/* Nome clicável para filtrar */}
                    <div
                      onClick={() => setFiltroProfessor(filtroProfessor === r.prof ? '' : r.prof)}
                      className="cursor-pointer"
                    >
                      <p className="font-semibold text-gray-800 mb-2">{r.prof}</p>
                      <div className="flex gap-3 text-sm">
                        <span className="text-gray-500">{r.total} sessões</span>
                        <span className="text-green-600">✓ {r.presencas}</span>
                        <span className="text-red-500">✗ {r.faltas}</span>
                      </div>
                      <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${r.pct >= 75 ? 'bg-green-500' : r.pct >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
                          style={{ width: `${r.pct}%` }}
                        />
                      </div>
                      <p className={`text-xs mt-1 font-medium ${r.pct >= 75 ? 'text-green-600' : r.pct >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {r.pct}% de presença
                      </p>
                    </div>

                    {/* Botão PDF separado do clique de filtro */}
                    <div className="mt-3 pt-3 border-t border-gray-100 print:hidden">
                      <button
                        onClick={() => handleExportarProfessor(r.prof)}
                        disabled={exportandoProf === r.prof}
                        className="w-full text-center text-blue-600 hover:text-blue-800 text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {exportandoProf === r.prof ? '⏳ Gerando PDF...' : '⬇ Exportar PDF'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Filtro */}
            <div className="print:hidden mb-4 flex items-center gap-3">
              <select
                value={filtroProfessor}
                onChange={(e) => setFiltroProfessor(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Todos os professores</option>
                {professores.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              {filtroProfessor && (
                <button onClick={() => setFiltroProfessor('')} className="text-sm text-gray-400 hover:text-gray-600">
                  ✕ Limpar filtro
                </button>
              )}
            </div>

            {/* Tabela de atendimentos */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <h2 className="font-semibold text-gray-700">
                  {filtroProfessor ? `Atendimentos — ${filtroProfessor}` : 'Todos os atendimentos'}
                </h2>
                <span className="text-sm text-gray-500">{atendimentosFiltrados.length} registro(s)</span>
              </div>

              {loadingProf ? (
                <p className="text-gray-500 text-center py-10">Carregando...</p>
              ) : atendimentosFiltrados.length === 0 ? (
                <p className="text-center text-gray-400 py-16">Nenhum atendimento encontrado.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-gray-600 font-medium">Data</th>
                      <th className="text-left px-4 py-3 text-gray-600 font-medium">Professor</th>
                      <th className="text-left px-4 py-3 text-gray-600 font-medium">Aluno</th>
                      <th className="text-left px-4 py-3 text-gray-600 font-medium">Escola</th>
                      <th className="text-left px-4 py-3 text-gray-600 font-medium">Tipo</th>
                      <th className="text-left px-4 py-3 text-gray-600 font-medium">Presença</th>
                      <th className="text-left px-4 py-3 text-gray-600 font-medium">Evolução</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {atendimentosFiltrados.map((a, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-500">
                          {a.data ? new Date(a.data + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-800">{a.professor}</td>
                        <td className="px-4 py-3 text-gray-700">{a.aluno}</td>
                        <td className="px-4 py-3 text-gray-500">{a.escola || '—'}</td>
                        <td className="px-4 py-3 text-gray-500">{a.tipo_atendimento || '—'}</td>
                        <td className="px-4 py-3">
                          {a.presente
                            ? <span className="text-green-600 text-xs font-medium">✓ Presente</span>
                            : <span className="text-red-500 text-xs font-medium">✗ Falta</span>}
                        </td>
                        <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{a.evolucao || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  )
}