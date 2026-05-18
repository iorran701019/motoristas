'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const formVazio = {
  aluno_id: '',
  nome: '',
  parentesco: '',
  telefone: '',
  telefone_alternativo: '',
  email: '',
  endereco: '',
  responsavel_principal: false,
}

export default function Responsaveis() {
  const router = useRouter()
  const [responsaveis, setResponsaveis] = useState<any[]>([])
  const [alunos, setAlunos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [editando, setEditando] = useState<any | null>(null)
  const [form, setForm] = useState(formVazio)

  useEffect(() => { carregar() }, [])

  const carregar = async () => {
    setLoading(true)
    const [{ data: resp }, { data: al }] = await Promise.all([
      supabase.from('responsaveis').select('*, alunos(nome)').order('nome'),
      supabase.from('alunos').select('id, nome').eq('ativo', true).order('nome'),
    ])
    setResponsaveis(resp || [])
    setAlunos(al || [])
    setLoading(false)
  }

  const abrirNovo = () => {
    setEditando(null)
    setForm(formVazio)
    setMostrarForm(true)
  }

  const abrirEditar = (r: any) => {
    setEditando(r)
    setForm({
      aluno_id: r.aluno_id || '',
      nome: r.nome || '',
      parentesco: r.parentesco || '',
      telefone: r.telefone || '',
      telefone_alternativo: r.telefone_alternativo || '',
      email: r.email || '',
      endereco: r.endereco || '',
      responsavel_principal: r.responsavel_principal || false,
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
    const payload = { ...form, aluno_id: form.aluno_id || null }

    if (editando) {
      await supabase.from('responsaveis').update(payload).eq('id', editando.id)
    } else {
      await supabase.from('responsaveis').insert([payload])
    }

    cancelar()
    setSalvando(false)
    carregar()
  }

  const campoClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"

  const [confirmando, setConfirmando] = useState<string | null>(null)

const desativar = async (id: string) => {
  await supabase.from('responsaveis').update({ ativo: false }).eq('id', id)
  setConfirmando(null)
  carregar()
}

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-blue-700 text-white px-6 py-4 shadow">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="text-blue-200 hover:text-white text-sm">← Início</button>
            <div>
              <h1 className="text-xl font-semibold">Responsáveis / Familiares</h1>
              <p className="text-blue-200 text-sm">{responsaveis.length} responsável(is) cadastrado(s)</p>
            </div>
          </div>
          <button onClick={abrirNovo} className="bg-white text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50">
            + Novo responsável
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {mostrarForm && (
          <form onSubmit={salvar} className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4">
            <h2 className="font-semibold text-gray-700 border-b pb-2">
              {editando ? `Editando: ${editando.nome}` : 'Novo responsável'}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Parentesco *</label>
                <select value={form.parentesco} onChange={(e) => setForm({ ...form, parentesco: e.target.value })} required className={campoClass}>
                  <option value="">Selecione...</option>
                  <option>Mãe</option>
                  <option>Pai</option>
                  <option>Avó</option>
                  <option>Avô</option>
                  <option>Tio(a)</option>
                  <option>Irmão(ã)</option>
                  <option>Responsável legal</option>
                  <option>Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone principal</label>
                <input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} placeholder="(00) 00000-0000" className={campoClass} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone alternativo</label>
                <input value={form.telefone_alternativo} onChange={(e) => setForm({ ...form, telefone_alternativo: e.target.value })} placeholder="(00) 00000-0000" className={campoClass} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={campoClass} />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                <input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} className={campoClass} />
              </div>

              <div className="sm:col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="resp_principal"
                  checked={form.responsavel_principal}
                  onChange={(e) => setForm({ ...form, responsavel_principal: e.target.checked })}
                  className="w-4 h-4 accent-blue-600"
                />
                <label htmlFor="resp_principal" className="text-sm text-gray-700">Responsável principal pelo aluno</label>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={cancelar} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
                Cancelar
              </button>
              <button type="submit" disabled={salvando} className="px-6 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {salvando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Salvar responsável'}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="text-gray-500 text-center py-10">Carregando...</p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {responsaveis.length === 0 ? (
              <p className="text-center text-gray-400 py-16">Nenhum responsável cadastrado ainda.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Nome</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Aluno</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Parentesco</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Telefone</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Principal</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {responsaveis.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <button onClick={() => abrirEditar(r)} className="text-gray-500 hover:text-gray-700 hover:underline text-xs">
                            Editar
                          </button>
                          {confirmando === r.id ? (
                            <span className="flex items-center gap-1">
                              <button onClick={() => desativar(r.id)} className="text-red-600 text-xs font-medium hover:underline">Confirmar</button>
                              <span className="text-gray-300">|</span>
                              <button onClick={() => setConfirmando(null)} className="text-gray-400 text-xs hover:underline">Cancelar</button>
                            </span>
                          ) : (
                            <button onClick={() => setConfirmando(r.id)} className="text-red-400 hover:text-red-600 text-xs">
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