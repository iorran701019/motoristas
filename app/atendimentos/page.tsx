'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { usePerfil } from '@/hooks/usePerfil'

export default function Atendimentos() {
  const router = useRouter()
  const { usuario, loading: loadingPerfil, isAdmin, isProfessor } = usePerfil()
  const [atendimentos, setAtendimentos] = useState<any[]>([])
  const [alunos, setAlunos] = useState<any[]>([])
  const [professores, setProfessores] = useState<any[]>([])
  const [horarios, setHorarios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [confirmando, setConfirmando] = useState<string | null>(null)
  const [form, setForm] = useState({
    aluno_id: '',
    professor_id: '',
    horario_id: '',
    data: '',
    presente: true,
    justificativa_falta: '',
    tipo_atendimento: '',
    habilidades_trabalhadas: '',
    evolucao: '',
    recursos_utilizados: '',
    objetivos_proxima_sessao: '',
    observacoes: '',
  })

  useEffect(() => {
    if (!loadingPerfil && usuario) {
      carregar()
      // Pré-seleciona o professor se for professor
      if (isProfessor && usuario.professor_id) {
        setForm((f) => ({ ...f, professor_id: usuario.professor_id! }))
      }
    }
  }, [loadingPerfil, usuario])

  const carregar = async () => {
    setLoading(true)

    let alunoIds: string[] = []

    if (isProfessor && usuario?.professor_id) {
      // Descobre alunos do professor
      const { data: horarios } = await supabase
        .from('horarios_atendimento')
        .select('aluno_id')
        .eq('professor_id', usuario.professor_id)
        .eq('ativo', true)
      alunoIds = [...new Set((horarios || []).map((h: any) => h.aluno_id))]
    }

    const [{ data: at }, { data: al }, { data: pr }] = await Promise.all([
      isProfessor && usuario?.professor_id
        ? supabase.from('atendimentos').select('*, alunos(nome), professores_aee(nome)')
            .eq('professor_id', usuario.professor_id)
            .order('data', { ascending: false }).limit(50)
        : supabase.from('atendimentos').select('*, alunos(nome), professores_aee(nome)')
            .order('data', { ascending: false }).limit(50),

      isProfessor && alunoIds.length > 0
        ? supabase.from('alunos').select('id, nome').in('id', alunoIds).eq('ativo', true).order('nome')
        : supabase.from('alunos').select('id, nome').eq('ativo', true).order('nome'),

      isAdmin
        ? supabase.from('professores_aee').select('id, nome').eq('ativo', true).order('nome')
        : { data: [] },
    ])

    setAtendimentos(at || [])
    setAlunos(al || [])
    setProfessores(pr || [])
    setLoading(false)
  }

  const carregarHorarios = async (aluno_id: string, professor_id: string) => {
    if (!aluno_id || !professor_id) return
    const { data } = await supabase
      .from('horarios_atendimento')
      .select('*')
      .eq('aluno_id', aluno_id)
      .eq('professor_id', professor_id)
      .eq('ativo', true)
    setHorarios(data || [])
  }

  const salvar = async (e: any) => {
    e.preventDefault()
    setSalvando(true)
    const professorId = isProfessor ? usuario?.professor_id : form.professor_id
    const payload = {
      ...form,
      professor_id: professorId,
      horario_id: form.horario_id || null,
      justificativa_falta: form.presente ? null : form.justificativa_falta,
    }
    await supabase.from('atendimentos').insert([payload])
    setForm({
      aluno_id: '', professor_id: isProfessor ? (usuario?.professor_id || '') : '',
      horario_id: '', data: '', presente: true, justificativa_falta: '',
      tipo_atendimento: '', habilidades_trabalhadas: '', evolucao: '',
      recursos_utilizados: '', objetivos_proxima_sessao: '', observacoes: '',
    })
    setMostrarForm(false)
    setSalvando(false)
    carregar()
  }

  const excluir = async (id: string) => {
    await supabase.from('atendimentos').delete().eq('id', id)
    setConfirmando(null)
    carregar()
  }

  const campoClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400'

  if (loadingPerfil) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Carregando...</p></div>

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-blue-700 text-white px-6 py-4 shadow">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="text-blue-200 hover:text-white text-sm">← Início</button>
            <div>
              <h1 className="text-xl font-semibold">Atendimentos</h1>
              <p className="text-blue-200 text-sm">Registro de sessões AEE</p>
            </div>
          </div>
          <button onClick={() => setMostrarForm(!mostrarForm)} className="bg-white text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50">
            {mostrarForm ? 'Cancelar' : '+ Registrar atendimento'}
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {mostrarForm && (
          <form onSubmit={salvar} className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4">
            <h2 className="font-semibold text-gray-700 border-b pb-2">Novo registro de atendimento</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aluno *</label>
                <select value={form.aluno_id} onChange={(e: any) => {
                  setForm({ ...form, aluno_id: e.target.value })
                  const profId = isProfessor ? usuario?.professor_id : form.professor_id
                  if (profId) carregarHorarios(e.target.value, profId)
                }} required className={campoClass}>
                  <option value="">Selecione...</option>
                  {alunos.map((a: any) => <option key={a.id} value={a.id}>{a.nome}</option>)}
                </select>
              </div>

              {isAdmin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Professor AEE *</label>
                  <select value={form.professor_id} onChange={(e: any) => {
                    setForm({ ...form, professor_id: e.target.value })
                    if (form.aluno_id) carregarHorarios(form.aluno_id, e.target.value)
                  }} required className={campoClass}>
                    <option value="">Selecione...</option>
                    {professores.map((p: any) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
                <input type="date" value={form.data} onChange={(e: any) => setForm({ ...form, data: e.target.value })} required className={campoClass} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de atendimento *</label>
                <select value={form.tipo_atendimento} onChange={(e: any) => setForm({ ...form, tipo_atendimento: e.target.value })} required className={campoClass}>
                  <option value="">Selecione...</option>
                  <option>Individual</option>
                  <option>Em grupo</option>
                  <option>Online</option>
                </select>
              </div>

              <div className="sm:col-span-2 flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">Presença:</label>
                <label className="flex items-center gap-1 text-sm text-gray-700 cursor-pointer">
                  <input type="radio" name="presente" checked={form.presente} onChange={() => setForm({ ...form, presente: true })} className="accent-blue-600" />
                  Presente
                </label>
                <label className="flex items-center gap-1 text-sm text-gray-700 cursor-pointer">
                  <input type="radio" name="presente" checked={!form.presente} onChange={() => setForm({ ...form, presente: false })} className="accent-red-500" />
                  Falta
                </label>
              </div>

              {!form.presente && (
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Justificativa da falta</label>
                  <input value={form.justificativa_falta} onChange={(e: any) => setForm({ ...form, justificativa_falta: e.target.value })} className={campoClass} />
                </div>
              )}

              {form.presente && (
                <>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Habilidades trabalhadas</label>
                    <textarea value={form.habilidades_trabalhadas} onChange={(e: any) => setForm({ ...form, habilidades_trabalhadas: e.target.value })} rows={2} className={campoClass} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Evolução observada</label>
                    <textarea value={form.evolucao} onChange={(e: any) => setForm({ ...form, evolucao: e.target.value })} rows={2} className={campoClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Recursos utilizados</label>
                    <input value={form.recursos_utilizados} onChange={(e: any) => setForm({ ...form, recursos_utilizados: e.target.value })} className={campoClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Objetivos próxima sessão</label>
                    <input value={form.objetivos_proxima_sessao} onChange={(e: any) => setForm({ ...form, objetivos_proxima_sessao: e.target.value })} className={campoClass} />
                  </div>
                </>
              )}

              {horarios.length > 0 && (
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horário agendado</label>
                  <select value={form.horario_id} onChange={(e: any) => setForm({ ...form, horario_id: e.target.value })} className={campoClass}>
                    <option value="">Selecione...</option>
                    {horarios.map((h: any) => (
                      <option key={h.id} value={h.id}>{h.dia_semana} {h.hora_inicio.slice(0,5)}–{h.hora_fim.slice(0,5)}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={salvando} className="px-6 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {salvando ? 'Salvando...' : 'Registrar atendimento'}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="text-gray-500 text-center py-10">Carregando...</p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {atendimentos.length === 0 ? (
              <p className="text-center text-gray-400 py-16">Nenhum atendimento registrado ainda.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Data</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Aluno</th>
                    {isAdmin && <th className="text-left px-4 py-3 text-gray-600 font-medium">Professor</th>}
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Tipo</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Presença</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Evolução</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {atendimentos.map((a: any) => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500">{new Date(a.data + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{a.alunos?.nome}</td>
                      {isAdmin && <td className="px-4 py-3 text-gray-500">{a.professores_aee?.nome}</td>}
                      <td className="px-4 py-3 text-gray-500">{a.tipo_atendimento}</td>
                      <td className="px-4 py-3">
                        {a.presente
                          ? <span className="text-green-600 text-xs font-medium">✓ Presente</span>
                          : <span className="text-red-500 text-xs font-medium">✗ Falta</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{a.evolucao || '—'}</td>
                      <td className="px-4 py-3">
                        {confirmando === a.id ? (
                          <span className="flex items-center gap-1">
                            <button onClick={() => excluir(a.id)} className="text-red-600 text-xs font-medium hover:underline">Confirmar</button>
                            <span className="text-gray-300">|</span>
                            <button onClick={() => setConfirmando(null)} className="text-gray-400 text-xs hover:underline">Cancelar</button>
                          </span>
                        ) : (
                          <button onClick={() => setConfirmando(a.id)} className="text-red-400 hover:text-red-600 text-xs">Excluir</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </main>
  )
}