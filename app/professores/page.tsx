'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Professor = {
  id: string
  nome: string
  cpf?: string
  matricula?: string
  telefone?: string
  email?: string
  formacao?: string
  especialidade?: string
  escola_id?: string
  escolas?: { nome: string }
  regime_contratacao?: string
  data_inicio_contrato?: string
  data_fim_contrato?: string
  observacoes?: string
}

type Escola = { id: string; nome: string }

const formVazio = {
  nome: '',
  cpf: '',
  matricula: '',
  telefone: '',
  email: '',
  formacao: '',
  especialidade: '',
  escola_id: '',
  regime_contratacao: '',
  data_inicio_contrato: '',
  data_fim_contrato: '',
  observacoes: '',
}

export default function ProfessoresAEE() {
  const router = useRouter()
  const [professores, setProfessores] = useState<Professor[]>([])
  const [escolas, setEscolas] = useState<Escola[]>([])
  const [loading, setLoading] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [editando, setEditando] = useState<Professor | null>(null)
  const [confirmando, setConfirmando] = useState<string | null>(null)
  const [form, setForm] = useState(formVazio)

  useEffect(() => { carregar() }, [])

  const carregar = async () => {
    setLoading(true)
    const [{ data: profs }, { data: esc }] = await Promise.all([
      supabase.from('professores_aee').select('*, escolas(nome)').eq('ativo', true).order('nome'),
      supabase.from('escolas').select('id, nome').eq('ativo', true).order('nome'),
    ])
    setProfessores(profs || [])
    setEscolas(esc || [])
    setLoading(false)
  }

  const abrirNovo = () => {
    setEditando(null)
    setForm(formVazio)
    setMostrarForm(true)
  }

  const abrirEditar = (p: Professor) => {
    setEditando(p)
    setForm({
      nome: p.nome || '',
      cpf: p.cpf || '',
      matricula: p.matricula || '',
      telefone: p.telefone || '',
      email: p.email || '',
      formacao: p.formacao || '',
      especialidade: p.especialidade || '',
      escola_id: p.escola_id || '',
      regime_contratacao: p.regime_contratacao || '',
      data_inicio_contrato: p.data_inicio_contrato || '',
      data_fim_contrato: p.data_fim_contrato || '',
      observacoes: p.observacoes || '',
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
    const payload = { ...form, escola_id: form.escola_id || null }
    if (editando) {
      await supabase.from('professores_aee').update(payload).eq('id', editando.id)
    } else {
      await supabase.from('professores_aee').insert([payload])
    }
    cancelar()
    setSalvando(false)
    carregar()
  }

  const desativar = async (id: string) => {
    await supabase.from('professores_aee').update({ ativo: false }).eq('id', id)
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
              <h1 className="text-xl font-semibold">Professores AEE</h1>
              <p className="text-blue-200 text-sm">{professores.length} professor(es) cadastrado(s)</p>
            </div>
          </div>
          <button onClick={abrirNovo} className="bg-white text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50">
            + Novo professor
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {mostrarForm && (
          <form onSubmit={salvar} className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4">
            <h2 className="font-semibold text-gray-700 border-b pb-2">
              {editando ? `Editando: ${editando.nome}` : 'Novo professor AEE'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo *</label>
                <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required className={campoClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CPF *</label>
                <input value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} required className={campoClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Matrícula</label>
                <input value={form.matricula} onChange={(e) => setForm({ ...form, matricula: e.target.value })} className={campoClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} className={campoClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={campoClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Formação</label>
                <input value={form.formacao} onChange={(e) => setForm({ ...form, formacao: e.target.value })} placeholder="Ex: Pedagogia" className={campoClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Especialidade</label>
                <input value={form.especialidade} onChange={(e) => setForm({ ...form, especialidade: e.target.value })} placeholder="Ex: TEA" className={campoClass} />
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
                  <option>Outro</option>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Escola</label>
                <select value={form.escola_id} onChange={(e) => setForm({ ...form, escola_id: e.target.value })} className={campoClass}>
                  <option value="">Selecione uma escola...</option>
                  {escolas.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}
                </select>
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
                {salvando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Salvar professor'}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="text-gray-500 text-center py-10">Carregando...</p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {professores.length === 0 ? (
              <p className="text-center text-gray-400 py-16">Nenhum professor cadastrado ainda.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Nome</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Matrícula</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Especialidade</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Escola</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Regime</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Fim contrato</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {professores.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{p.nome}</td>
                      <td className="px-4 py-3 text-gray-500">{p.matricula || '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{p.especialidade || '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{p.escolas?.nome || '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{p.regime_contratacao || '—'}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {p.data_fim_contrato ? new Date(p.data_fim_contrato).toLocaleDateString('pt-BR') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <button onClick={() => abrirEditar(p)} className="text-gray-500 hover:text-gray-700 hover:underline text-xs">
                            Editar
                          </button>
                          {confirmando === p.id ? (
                            <span className="flex items-center gap-1">
                              <button onClick={() => desativar(p.id)} className="text-red-600 text-xs font-medium hover:underline">Confirmar</button>
                              <span className="text-gray-300">|</span>
                              <button onClick={() => setConfirmando(null)} className="text-gray-400 text-xs hover:underline">Cancelar</button>
                            </span>
                          ) : (
                            <button onClick={() => setConfirmando(p.id)} className="text-red-400 hover:text-red-600 text-xs">
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