'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Escolas() {
  const router = useRouter()
  const [escolas, setEscolas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [confirmando, setConfirmando] = useState<string | null>(null)
  const [form, setForm] = useState({ nome: '', endereco: '', municipio: '', inep: '', telefone: '', email: '' })

  useEffect(() => { carregar() }, [])

  const carregar = async () => {
    setLoading(true)
    const { data } = await supabase.from('escolas').select('*').eq('ativo', true).order('nome')
    setEscolas(data || [])
    setLoading(false)
  }

  const salvar = async (e: any) => {
    e.preventDefault()
    setSalvando(true)
    await supabase.from('escolas').insert([form])
    setForm({ nome: '', endereco: '', municipio: '', inep: '', telefone: '', email: '' })
    setMostrarForm(false)
    setSalvando(false)
    carregar()
  }

  const desativar = async (id: string) => {
    await supabase.from('escolas').update({ ativo: false }).eq('id', id)
    setConfirmando(null)
    carregar()
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-blue-700 text-white px-6 py-4 shadow">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="text-blue-200 hover:text-white text-sm">← Início</button>
            <div>
              <h1 className="text-xl font-semibold">Escolas</h1>
              <p className="text-blue-200 text-sm">{escolas.length} unidade(s) cadastrada(s)</p>
            </div>
          </div>
          <button onClick={() => setMostrarForm(!mostrarForm)} className="bg-white text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50">
            {mostrarForm ? 'Cancelar' : '+ Nova escola'}
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-6">
        {mostrarForm && (
          <form onSubmit={salvar} className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4">
            <h2 className="font-semibold text-gray-700 border-b pb-2">Nova escola</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input value={form.nome} onChange={(e: any) => setForm({ ...form, nome: e.target.value })} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Município *</label>
                <input value={form.municipio} onChange={(e: any) => setForm({ ...form, municipio: e.target.value })} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">INEP</label>
                <input value={form.inep} onChange={(e: any) => setForm({ ...form, inep: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input value={form.telefone} onChange={(e: any) => setForm({ ...form, telefone: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <input type="email" value={form.email} onChange={(e: any) => setForm({ ...form, email: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                <input value={form.endereco} onChange={(e: any) => setForm({ ...form, endereco: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={salvando} className="px-6 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {salvando ? 'Salvando...' : 'Salvar escola'}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="text-gray-500 text-center py-10">Carregando...</p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {escolas.length === 0 ? (
              <p className="text-center text-gray-400 py-16">Nenhuma escola cadastrada ainda.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Nome</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Município</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">INEP</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Telefone</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {escolas.map((e: any) => (
                    <tr key={e.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{e.nome}</td>
                      <td className="px-4 py-3 text-gray-500">{e.municipio}</td>
                      <td className="px-4 py-3 text-gray-500">{e.inep || '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{e.telefone || '—'}</td>
                      <td className="px-4 py-3">
                        {confirmando === e.id ? (
                          <span className="flex items-center gap-1">
                            <button onClick={() => desativar(e.id)} className="text-red-600 text-xs font-medium hover:underline">Confirmar</button>
                            <span className="text-gray-300">|</span>
                            <button onClick={() => setConfirmando(null)} className="text-gray-400 text-xs hover:underline">Cancelar</button>
                          </span>
                        ) : (
                          <button onClick={() => setConfirmando(e.id)} className="text-red-400 hover:text-red-600 text-xs">Desativar</button>
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