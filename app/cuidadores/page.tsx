'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Aluno = { id: string; nome: string }

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
}

export default function AgentesApoio() {
  const router = useRouter()
  const [agentes, setAgentes] = useState<AgenteApoio[]>([])
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [loading, setLoading] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [editando, setEditando] = useState<AgenteApoio | null>(null)
  const [confirmando, setConfirmando] = useState<string | null>(null)
  const [form, setForm] = useState(formVazio)

  useEffect(() => { carregar() }, [])

  const carregar = async () => {
    setLoading(true)
    const [{ data: ag }, { data: al }] = await Promise.all([
      supabase.from('cuidadores').select('*, alunos(nome)').eq('ativo', true).order('nome'),
      supabase.from('alunos').select('id, nome').eq('ativo', true).order('nome'),
    ])
    setAgentes((ag as AgenteApoio[]) || [])
    setAlunos((al as Aluno[]) || [])
    setLoading(false)
  }

  const abrirNovo = () => {
    setEditando(null)
    setForm(formVazio)
    setMostrarForm(true)
  }

  const abrirEditar = (a: AgenteApoio) => {
    setEditando(a)
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
    })
    setMostrarForm(true)
  }

  const cancelar = () => {
    setMostrarForm(false)
    setEditando(null)
    setForm(formVazio)
  }

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault()
    setSalvando(true)
    if (editando) {
      await supabase.from('cuidadores').update(form).eq('id', editando.id)
    } else {
      await supabase.from('cuidadores').insert([form])
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Regime de contratação *</label>
                <select value={form.regime_contratacao} onChange={(e) => setForm({ ...form, regime_contratacao: e.target.value })} required className={campoClass}>
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
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Matrícula</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Aluno</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Regime</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Turno</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Fim contrato</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {agentes.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{a.nome}</td>
                      <td className="px-4 py-3 text-gray-500">{a.matricula || '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{a.alunos?.nome || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{a.regime_contratacao || '—'}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{a.turno || '—'}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {a.data_fim_contrato ? new Date(a.data_fim_contrato).toLocaleDateString('pt-BR') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <button onClick={() => abrirEditar(a)} className="text-gray-500 hover:text-gray-700 hover:underline text-xs">
                            Editar
                          </button>
                          {confirmando === a.id ? (
                            <span className="flex items-center gap-1">
                              <button onClick={() => desativar(a.id)} className="text-red-600 text-xs font-medium hover:underline">Confirmar</button>
                              <span className="text-gray-300">|</span>
                              <button onClick={() => setConfirmando(null)} className="text-gray-400 text-xs hover:underline">Cancelar</button>
                            </span>
                          ) : (
                            <button onClick={() => setConfirmando(a.id)} className="text-red-400 hover:text-red-600 text-xs">
                              Desativar
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
        )}
      </div>
    </main>
  )
}