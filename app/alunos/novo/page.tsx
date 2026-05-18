'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Escola = {
  id: string
  nome: string
}

const tiposDeficiencia = [
  'Deficiência Intelectual',
  'Deficiência Física',
  'Deficiência Visual',
  'Deficiência Auditiva / Surdez',
  'Surdocegueira',
  'Transtorno do Espectro Autista (TEA)',
  'Altas Habilidades / Superdotação',
  'Transtornos Globais do Desenvolvimento',
  'Outro',
]

export default function CadastroAluno() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [escolas, setEscolas] = useState<Escola[]>([])

  const [form, setForm] = useState({
    escola_id: '',
    nome: '',
    data_nascimento: '',
    cpf: '',
    numero_matricula: '',
    tipo_deficiencia: '',
    cid: '',
    tem_laudo: false,
    laudo_descricao: '',
    necessidades_especificas: '',
    observacoes: '',
  })

  useEffect(() => {
    carregarEscolas()
  }, [])

  const carregarEscolas = async () => {
    const { data, error } = await supabase
      .from('escolas')
      .select('id, nome')
      .eq('ativo', true)
      .order('nome')

    if (!error) {
      setEscolas(data || [])
    }
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target

    const checked =
      type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : false

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setLoading(true)
    setErro('')

    try {
      // =========================
      // PEGA USUÁRIO LOGADO
      // =========================
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        setErro('Usuário não autenticado.')
        setLoading(false)
        return
      }

      // =========================
      // PAYLOAD
      // =========================
      const payload = {
        ...form,
        escola_id: form.escola_id || null,
        user_id: user.id,
      }

      // =========================
      // INSERT
      // =========================
      const { error } = await supabase
        .from('alunos')
        .insert([payload])

      if (error) {
        setErro('Erro ao salvar: ' + error.message)
      } else {
        setSucesso(true)

        setTimeout(() => {
          router.push('/alunos')
        }, 1500)
      }
    } catch (err: any) {
      setErro(err.message || 'Erro inesperado.')
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      <header className="bg-blue-700 text-white px-4 sm:px-6 py-4 shadow">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button
            onClick={() => router.push('/alunos')}
            className="text-blue-200 hover:text-white text-sm"
          >
            ← Voltar
          </button>

          <div>
            <h1 className="text-lg sm:text-xl font-semibold">
              Cadastro de Aluno
            </h1>

            <p className="text-blue-200 text-sm">
              Preencha os dados do aluno
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {sucesso && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 mb-6">
            ✅ Aluno cadastrado com sucesso! Redirecionando...
          </div>
        )}

        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
            ❌ {erro}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 space-y-5"
        >
          <h2 className="font-semibold text-gray-700 border-b pb-2">
            Dados pessoais
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome completo *
              </label>

              <input
                type="text"
                name="nome"
                value={form.nome}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de nascimento
              </label>

              <input
                type="date"
                name="data_nascimento"
                value={form.data_nascimento}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CPF
              </label>

              <input
                type="text"
                name="cpf"
                value={form.cpf}
                onChange={handleChange}
                placeholder="000.000.000-00"
                className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de matrícula *
              </label>

              <input
                type="text"
                name="numero_matricula"
                value={form.numero_matricula}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Escola
              </label>

              <select
                name="escola_id"
                value={form.escola_id}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Selecione a escola...</option>

                {escolas.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <h2 className="font-semibold text-gray-700 border-b pb-2 pt-2">
            Informações da deficiência
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de deficiência *
              </label>

              <select
                name="tipo_deficiencia"
                value={form.tipo_deficiencia}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Selecione...</option>

                {tiposDeficiencia.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CID
              </label>

              <input
                type="text"
                name="cid"
                value={form.cid}
                onChange={handleChange}
                placeholder="Ex: F84.0"
                className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="tem_laudo"
                name="tem_laudo"
                checked={form.tem_laudo}
                onChange={handleChange}
                className="w-4 h-4 accent-blue-600"
              />

              <label
                htmlFor="tem_laudo"
                className="text-sm text-gray-700"
              >
                Possui laudo médico
              </label>
            </div>

            {form.tem_laudo && (
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição do laudo
                </label>

                <textarea
                  name="laudo_descricao"
                  value={form.laudo_descricao}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            )}

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Necessidades específicas
              </label>

              <textarea
                name="necessidades_especificas"
                value={form.necessidades_especificas}
                onChange={handleChange}
                rows={3}
                placeholder="Descreva as necessidades pedagógicas e de apoio do aluno..."
                className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações gerais
              </label>

              <textarea
                name="observacoes"
                value={form.observacoes}
                onChange={handleChange}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push('/alunos')}
              className="w-full sm:w-auto px-4 py-3 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar aluno'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}