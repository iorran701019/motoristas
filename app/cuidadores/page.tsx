'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Aluno = { id: string; nome: string }
type Escola = { id: string; nome: string }

type AgenteApoio = {
  id: string
  nome: string
  cpf?: string
  matricula?: string
  telefone?: string
  regime_contratacao?: string
  funcao?: string
  turno?: string
  aluno_id?: string
  alunos?: { nome: string }
  data_inicio_contrato?: string
  data_fim_contrato?: string
  observacoes?: string
  polo?: number
  coordenadora_polo?: string
  escolas_vinculadas?: Escola[]
}

const formVazio = {
  aluno_id: '',
  nome: '',
  cpf: '',
  matricula: '',
  telefone: '',
  regime_contratacao: '',
  funcao: '',
  turno: '',
  data_inicio_contrato: '',
  data_fim_contrato: '',
  observacoes: '',
  polo: '',
  coordenadora_polo: '',
  escolasSelecionadas: [] as string[],
}

export default function AgentesApoio() {
  const router = useRouter()
  const [agentes, setAgentes] = useState<AgenteApoio[]>([])
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [escolas, setEscolas] = useState<Escola[]>([])
  const [loading, setLoading] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [editando, setEditando] = useState<AgenteApoio | null>(null)
  const [confirmando, setConfirmando] = useState<string | null>(null)
  const [form, setForm] = useState(formVazio)

  useEffect(() => { carregar() }, [])

  const carregar = async () => {
    setLoading(true)
    const [{ data: ag }, { data: al }, { data: esc }] = await Promise.all([
      supabase.from('cuidadores').select('*, alunos(nome)').eq('ativo', true).order('nome'),
      supabase.from('alunos').select('id, nome').eq('ativo', true).order('nome'),
      supabase.from('escolas').select('id, nome').eq('ativo', true).order('nome'),
    ])

    // Para cada agente, busca as escolas vinculadas
    const agentesComEscolas: AgenteApoio[] = []
    for (const a of (ag || [])) {
      const { data: ce } = await supabase
        .from('cuidadores_escolas')
        .select('escola_id, escolas(id, nome)')
        .eq('cuidador_id', a.id)
      agentesComEscolas.push({
        ...a,
        escolas_vinculadas: (ce || []).map((x: any) => x.escolas).filter(Boolean),
      })
    }

    setAgentes(agentesComEscolas)
    setAlunos((al as Aluno[]) || [])
    setEscolas((esc as Escola[]) || [])
    setLoading(false)
  }

  const abrirNovo = () => {
    setEditando(null)
    setForm(formVazio)
    setMostrarForm(true)
  }

  const abrirEditar = async (a: AgenteApoio) => {
    setEditando(a)
    const { data: ce } = await supabase
      .from('cuidadores_escolas')
      .select('escola_id')
      .eq('cuidador_id', a.id)
    setForm({
      aluno_id: a.aluno_id || '',
      nome: a.nome || '',
      cpf: a.cpf || '',
      matricula: a.matricula || '',
      telefone: a.telefone || '',
      regime_contratacao: a.regime_contratacao || '',
      funcao: a.funcao || '',
      turno: a.turno || '',
      data_inicio_contrato: a.data_inicio_contrato || '',
      data_fim_contrato: a.data_fim_contrato || '',
      observacoes: a.observacoes || '',
      polo: a.polo?.toString() || '',
      coordenadora_polo: a.coordenadora_polo || '',
      escolasSelecionadas: (ce || []).map((x: any) => x.escola_id),
    })
    setMostrarForm(true)
  }

  const cancelar = () => {
    setMostrarForm(false)
    setEditando(null)
    setForm(formVazio)
  }

  const toggleEscola = (id: string) => {
    setForm((prev) => ({
      ...prev,
      escolasSelecionadas: prev.escolasSelecionadas.includes(id)
        ? prev.escolasSelecionadas.filter((e) => e !== id)
        : [...prev.escolasSelecionadas, id],
    }))
  }

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault()
    setSalvando(true)

    const payload = {
      aluno_id: form.aluno_id || null,
      nome: form.nome,
      cpf: form.cpf,
      matricula: form.matricula,
      telefone: form.telefone,
      regime_contratacao: form.regime_contratacao,
      funcao: form.funcao,
      turno: form.turno,
      data_inicio_contrato: form.data_inicio_contrato || null,
      data_fim_contrato: form.data_fim_contrato || null,
      observacoes: form.observacoes,
      polo: form.polo ? parseInt(form.polo) : null,
      coordenadora_polo: form.coordenadora_polo,
    }

    let cuidadorId: string

    if (editando) {
      await supabase.from('cuidadores').update(payload).eq('id', editando.id)
      cuidadorId = editando.id
      // Limpa vínculos antigos de escolas
      await supabase.from('cuidadores_escolas').delete().eq('cuidador_id', cuidadorId)
    } else {
      const { data } = await supabase.from('cuidadores').insert([payload]).select('id').single()
      cuidadorId = data?.id
    }

    // Insere novos vínculos de escolas
    if (form.escolasSelecionadas.length > 0 && cuidadorId) {
      await supabase.from('cuidadores_escolas').insert(
        form.escolasSelecionadas.map((escola_id) => ({ cuidador_id: cuidadorId, escola_id }))
      )
    }

    cancelar()
    setSalvando(false)
    carregar()
  }

  const desativar = async (id: string) => {
    await supabase.from('cuidadores').update({ ativo: false }).eq('id', id)
    setConfirmando(null)
    carregar()
  }

  const campoClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400'

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-blue-700 text-white px-6 py-4 shadow">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="text-blue-200 hover:text-white text-sm">← Início</button>
            <div>
              <h1 className="text-xl font-semibold">Agentes de Apoio</h1>
              <p className="text-blue-200 text-sm">{agentes.length} agente(s) cadastrado(s)</p>
            </div>
          </div>
          <button onClick={abrirNovo} className="bg-white text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50">
            + Novo agente de apoio
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {mostrarForm && (
          <form onSubmit={salvar} className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4">
            <h2 className="font-semibold text-gray-700 border-b pb-2">
              {editando ? `Editando: ${editando.nome}` : 'Novo agente de apoio'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Dados pessoais */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Aluno vinculado *</label>
                <select value={form.aluno_id} onChange={(e) => setForm({ ...form, aluno_id: e.target.value })} required className={campoClass}>
                  <option value="">Selecione o aluno...</option>
                  {alunos.map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo *</label>
                <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required className={campoClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                <input value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} placeholder="000.000.000-00" className={campoClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Matrícula</label>
                <input value={form.matricula} onChange={(e) => setForm({ ...form, matricula: e.target.value })} className={campoClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} placeholder="(00) 00000-0000" className={campoClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Regime de contratação</label>
                <select value={form.regime_contratacao} onChange={(e) => setForm({ ...form, regime_contratacao: e.target.value })} className={campoClass}>
                  <option value="">Selecione...</option>
                  <option>CLT</option>
                  <option>Estágio</option>
                  <option>Concursado</option>
                  <option>Servidor público</option>
                  <option>Terceirizado</option>
                  <option>Voluntário</option>
                  <option>Outro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Função</label>
                <select value={form.funcao} onChange={(e) => setForm({ ...form, funcao: e.target.value })} className={campoClass}>
                  <option value="">Selecione...</option>
                  <option>Agente de Apoio Escolar</option>
                  <option>Auxiliar de Vida Escolar (AVE)</option>
                  <option>Cuidador Escolar</option>
                  <option>Auxiliar de Inclusão</option>
                  <option>Intérprete de Libras</option>
                  <option>Outro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Turno</label>
                <select value={form.turno} onChange={(e) => setForm({ ...form, turno: e.target.value })} className={campoClass}>
                  <option value="">Selecione...</option>
                  <option>Manhã</option>
                  <option>Tarde</option>
                  <option>Integral</option>
                  <option>Noite</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Início do contrato</label>
                <input type="date" value={form.data_inicio_contrato} onChange={(e) => setForm({ ...form, data_inicio_contrato: e.target.value })} className={campoClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fim do contrato</label>
                <input type="date" value={form.data_fim_contrato} onChange={(e) => setForm({ ...form, data_fim_contrato: e.target.value })} className={campoClass} />
              </div>

              {/* Polo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Polo (1–15)</label>
                <select value={form.polo} onChange={(e) => setForm({ ...form, polo: e.target.value })} className={campoClass}>
                  <option value="">Selecione...</option>
                  {Array.from({ length: 15 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>Polo {n}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coordenadora responsável</label>
                <input value={form.coordenadora_polo} onChange={(e) => setForm({ ...form, coordenadora_polo: e.target.value })} placeholder="Nome da coordenadora" className={campoClass} />
              </div>

              {/* Escolas de atuação */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Escola(s) onde está atuando</label>
                <div className="border border-gray-300 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {escolas.map((e) => (
                    <label key={e.id} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:text-blue-700">
                      <input
                        type="checkbox"
                        checked={form.escolasSelecionadas.includes(e.id)}
                        onChange={() => toggleEscola(e.id)}
                        className="w-4 h-4 accent-blue-600"
                      />
                      {e.nome}
                    </label>
                  ))}
                  {escolas.length === 0 && <p className="text-gray-400 text-sm">Nenhuma escola cadastrada.</p>}
                </div>
                {form.escolasSelecionadas.length > 0 && (
                  <p className="text-xs text-blue-600 mt-1">{form.escolasSelecionadas.length} escola(s) selecionada(s)</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} rows={2} className={campoClass} />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={cancelar} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
                Cancelar
              </button>
              <button type="submit" disabled={salvando} className="px-6 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {salvando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Salvar agente de apoio'}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="text-gray-500 text-center py-10">Carregando...</p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {agentes.length === 0 ? (
              <p className="text-center text-gray-400 py-16">Nenhum agente de apoio cadastrado ainda.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Nome</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Aluno</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Polo</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Escolas</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Regime</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Turno</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {agentes.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{a.nome}</td>
                      <td className="px-4 py-3 text-gray-500">{a.alunos?.nome || '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{a.polo ? `Polo ${a.polo}` : '—'}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-xs">
                        {a.escolas_vinculadas && a.escolas_vinculadas.length > 0
                          ? a.escolas_vinculadas.map((e) => e.nome).join(', ')
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{a.regime_contratacao || '—'}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{a.turno || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Link href={`/cuidadores/${a.id}`} className="text-blue-600 hover:underline text-xs">Ver perfil</Link>
                          <button onClick={() => abrirEditar(a)} className="text-gray-500 hover:text-gray-700 hover:underline text-xs">Editar</button>
                          {confirmando === a.id ? (
                            <span className="flex items-center gap-1">
                              <button onClick={() => desativar(a.id)} className="text-red-600 text-xs font-medium hover:underline">Confirmar</button>
                              <span className="text-gray-300">|</span>
                              <button onClick={() => setConfirmando(null)} className="text-gray-400 text-xs hover:underline">Cancelar</button>
                            </span>
                          ) : (
                            <button onClick={() => setConfirmando(a.id)} className="text-red-400 hover:text-red-600 text-xs">Desativar</button>
                          )}
                        </div>
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