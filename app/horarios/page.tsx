'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const DIAS = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira'
]

export default function Horarios() {
  const router = useRouter()

  const [horarios, setHorarios] = useState<any[]>([])
  const [alunos, setAlunos] = useState<any[]>([])
  const [professores, setProfessores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [salvando, setSalvando] = useState(false)

  const [form, setForm] = useState({
    aluno_id: '',
    professor_id: '',
    dia_semana: '',
    hora_inicio: '',
    hora_fim: '',
    local: '',
    tipo_atendimento: ''
  })

  useEffect(() => {
    carregar()
  }, [])

  const carregar = async () => {
    setLoading(true)

    const [{ data: hor }, { data: al }, { data: pr }] = await Promise.all([
      supabase
        .from('horarios_atendimento')
        .select('*, alunos(nome), professores_aee(nome)')
        .eq('ativo', true)
        .order('dia_semana'),

      supabase
        .from('alunos')
        .select('id, nome')
        .eq('ativo', true)
        .order('nome'),

      supabase
        .from('professores_aee')
        .select('id, nome')
        .eq('ativo', true)
        .order('nome')
    ])

    setHorarios(hor || [])
    setAlunos(al || [])
    setProfessores(pr || [])
    setLoading(false)
  }

  const salvar = async (e: any) => {
    e.preventDefault()

    setSalvando(true)

    await supabase
      .from('horarios_atendimento')
      .insert([form])

    setForm({
      aluno_id: '',
      professor_id: '',
      dia_semana: '',
      hora_inicio: '',
      hora_fim: '',
      local: '',
      tipo_atendimento: ''
    })

    setMostrarForm(false)
    setSalvando(false)

    carregar()
  }

  const porDia: any = DIAS.reduce((acc: any, dia) => {
    acc[dia] = horarios.filter((h: any) => h.dia_semana === dia)
    return acc
  }, {})

  const [confirmando, setConfirmando] = useState<string | null>(null)

  const desativar = async (id: string) => {
    await supabase.from('horarios_atendimento').update({ ativo: false }).eq('id', id)
    setConfirmando(null)
    carregar()
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-blue-700 text-white px-6 py-4 shadow">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="text-blue-200 hover:text-white text-sm"
            >
              ← Início
            </button>

            <div>
              <h1 className="text-xl font-semibold">
                Horários de Atendimento
              </h1>

              <p className="text-blue-200 text-sm">
                Agenda semanal AEE
              </p>
            </div>
          </div>

          <button
            onClick={() => setMostrarForm(!mostrarForm)}
            className="bg-white text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50"
          >
            {mostrarForm ? 'Cancelar' : '+ Novo horário'}
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-6">

        {mostrarForm && (
          <form
            onSubmit={salvar}
            className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4"
          >
            <h2 className="font-semibold text-gray-700 border-b pb-2">
              Novo horário de atendimento
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aluno *
                </label>

                <select
                  value={form.aluno_id}
                  onChange={(e) =>
                    setForm({ ...form, aluno_id: e.target.value })
                  }
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">Selecione...</option>

                  {alunos.map((a: any) => (
                    <option key={a.id} value={a.id}>
                      {a.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Professor AEE *
                </label>

                <select
                  value={form.professor_id}
                  onChange={(e) =>
                    setForm({ ...form, professor_id: e.target.value })
                  }
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">Selecione...</option>

                  {professores.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dia da semana *
                </label>

                <select
                  value={form.dia_semana}
                  onChange={(e) =>
                    setForm({ ...form, dia_semana: e.target.value })
                  }
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">Selecione...</option>

                  {DIAS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de atendimento
                </label>

                <select
                  value={form.tipo_atendimento}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tipo_atendimento: e.target.value
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">Selecione...</option>
                  <option>Individual</option>
                  <option>Em grupo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora início *
                </label>

                <input
                  type="time"
                  value={form.hora_inicio}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      hora_inicio: e.target.value
                    })
                  }
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora fim *
                </label>

                <input
                  type="time"
                  value={form.hora_fim}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      hora_fim: e.target.value
                    })
                  }
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Local
                </label>

                <input
                  value={form.local}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      local: e.target.value
                    })
                  }
                  placeholder="Ex: Sala de Recursos Multifuncionais"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={salvando}
                className="px-6 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {salvando ? 'Salvando...' : 'Salvar horário'}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="text-gray-500 text-center py-10">
            Carregando...
          </p>
        ) : (
          <div className="space-y-4">

            {DIAS.map((dia) => (
              <div
                key={dia}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
                  <h3 className="font-semibold text-gray-700 text-sm">
                    {dia}
                  </h3>
                </div>

                {porDia[dia].length === 0 ? (
                  <p className="text-gray-400 text-sm px-4 py-3">
                    Nenhum atendimento agendado
                  </p>
                ) : (
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-gray-100">

                      {porDia[dia]
                        .sort((a: any, b: any) =>
                          a.hora_inicio.localeCompare(b.hora_inicio)
                        )
                        .map((h: any) => (
                          <tr
                            key={h.id}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-4 py-3 text-gray-500 w-24">
                              {h.hora_inicio.slice(0, 5)} – {h.hora_fim.slice(0, 5)}
                            </td>

                            <td className="px-4 py-3 font-medium text-gray-800">
                              {h.alunos?.nome}
                            </td>

                            <td className="px-4 py-3 text-gray-500">
                              {h.professores_aee?.nome}
                            </td>

                            <td className="px-4 py-3">
                              {h.tipo_atendimento && (
                                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                                  {h.tipo_atendimento}
                                </span>
                              )}
                            </td>

                            <td className="px-4 py-3 text-gray-400 text-xs">
                              {h.local}
                            </td>

                              <td className="px-4 py-3 text-right">
                                {confirmando === h.id ? (
                                  <span className="flex items-center justify-end gap-1">
                                    <button onClick={() => desativar(h.id)} className="text-red-600 text-xs font-medium hover:underline">Confirmar</button>
                                    <span className="text-gray-300">|</span>
                                    <button onClick={() => setConfirmando(null)} className="text-gray-400 text-xs hover:underline">Cancelar</button>
                                  </span>
                                ) : (
                                  <button onClick={() => setConfirmando(h.id)} className="text-red-400 hover:text-red-600 text-xs">
                                    Desativar
                                  </button>
                                )}
                              </td>

                          </tr>

                        ))}

                    </tbody>
                  </table>
                )}
              </div>
            ))}

          </div>
        )}
      </div>
    </main>
  )
}