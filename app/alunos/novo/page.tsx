'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Escola = { id: string; nome: string }

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

const anosEscolares = [
  '1º ano - EF', '2º ano - EF', '3º ano - EF', '4º ano - EF', '5º ano - EF',
  '6º ano - EF', '7º ano - EF', '8º ano - EF', '9º ano - EF',
  '1ª série - EM', '2ª série - EM', '3ª série - EM',
  'EJA', 'Educação Infantil', 'Outro',
]

export default function CadastroAluno() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [escolas, setEscolas] = useState<Escola[]>([])
  const [form, setForm] = useState({
    nome: '',
    escola_id: '',
    data_nascimento: '',
    cpf: '',
    numero_matricula: '',
    tipo_deficiencia: '',
    cid: '',
    tem_laudo: false,
    laudo_descricao: '',
    necessidades_especificas: '',
    observacoes: '',
    ano_escolar: '',
    turno: '',
    data_avaliacao_cemae: '',
    status_cemae: '',
    prioridade_cuidador: '',
    judicializacao: false,
    obs_judicializacao: '',
  })

  useEffect(() => {
    supabase.from('escolas').select('id, nome').eq('ativo', true).order('nome')
      .then(({ data }) => setEscolas(data || []))
  }, [])

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    setErro('')
    const payload = { ...form, escola_id: form.escola_id || null }
    const { error } = await supabase.from('alunos').insert([payload])
    if (error) {
      setErro('Erro ao salvar: ' + error.message)
    } else {
      setSucesso(true)
      setTimeout(() => router.push('/alunos'), 1500)
    }
    setLoading(false)
  }

  const campoClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400'

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      <header className="bg-blue-700 text-white px-6 py-4 shadow">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button onClick={() => router.push('/alunos')} className="text-blue-200 hover:text-white text-sm">
            ← Voltar
          </button>
          <div>
            <h1 className="text-xl font-semibold">Cadastro de Aluno</h1>
            <p className="text-blue-200 text-sm">Preencha os dados do aluno</p>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8">
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

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">

          {/* Dados pessoais */}
          <h2 className="font-semibold text-gray-700 border-b pb-2">Dados pessoais</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo *</label>
              <input name="nome" value={form.nome} onChange={handleChange} required className={campoClass} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Escola *</label>
              <select name="escola_id" value={form.escola_id} onChange={handleChange} required className={campoClass}>
                <option value="">Selecione a escola...</option>
                {escolas.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de nascimento</label>
              <input type="date" name="data_nascimento" value={form.data_nascimento} onChange={handleChange} className={campoClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
              <input name="cpf" value={form.cpf} onChange={handleChange} placeholder="000.000.000-00" className={campoClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número de matrícula *</label>
              <input name="numero_matricula" value={form.numero_matricula} onChange={handleChange} required className={campoClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ano escolar</label>
              <select name="ano_escolar" value={form.ano_escolar} onChange={handleChange} className={campoClass}>
                <option value="">Selecione...</option>
                {anosEscolares.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Turno</label>
              <select name="turno" value={form.turno} onChange={handleChange} className={campoClass}>
                <option value="">Selecione...</option>
                <option>Manhã</option>
                <option>Tarde</option>
                <option>Integral</option>
                <option>Noite</option>
              </select>
            </div>
          </div>

          {/* Deficiência */}
          <h2 className="font-semibold text-gray-700 border-b pb-2 pt-2">Informações da deficiência</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de deficiência *</label>
              <select name="tipo_deficiencia" value={form.tipo_deficiencia} onChange={handleChange} required className={campoClass}>
                <option value="">Selecione...</option>
                {tiposDeficiencia.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CID</label>
              <input name="cid" value={form.cid} onChange={handleChange} placeholder="Ex: F84.0" className={campoClass} />
            </div>
            <div className="sm:col-span-2 flex items-center gap-2">
              <input type="checkbox" id="tem_laudo" name="tem_laudo" checked={form.tem_laudo} onChange={handleChange} className="w-4 h-4 accent-blue-600" />
              <label htmlFor="tem_laudo" className="text-sm text-gray-700">Possui laudo médico</label>
            </div>
            {form.tem_laudo && (
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição do laudo</label>
                <textarea name="laudo_descricao" value={form.laudo_descricao} onChange={handleChange} rows={3} className={campoClass} />
              </div>
            )}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Necessidades específicas</label>
              <textarea name="necessidades_especificas" value={form.necessidades_especificas} onChange={handleChange} rows={3} placeholder="Descreva as necessidades pedagógicas e de apoio do aluno..." className={campoClass} />
            </div>
          </div>

          {/* CEMAE */}
          <h2 className="font-semibold text-gray-700 border-b pb-2 pt-2">Avaliação CEMAE / Cuidador</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de avaliação CEMAE</label>
              <input type="date" name="data_avaliacao_cemae" value={form.data_avaliacao_cemae} onChange={handleChange} className={campoClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status CEMAE</label>
              <select name="status_cemae" value={form.status_cemae} onChange={handleChange} className={campoClass}>
                <option value="">Selecione...</option>
                <option value="demanda_cuidador">Demanda cuidador</option>
                <option value="nao_demanda_cuidador">Não demanda cuidador</option>
                <option value="em_estudo">Em estudo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade (demanda cuidador)</label>
              <select name="prioridade_cuidador" value={form.prioridade_cuidador} onChange={handleChange} className={campoClass}>
                <option value="">Selecione...</option>
                <option value="urgentissimo">🔴 Urgentíssimo</option>
                <option value="urgente">🟡 Urgente</option>
                <option value="desejavel">🟢 Desejável</option>
              </select>
            </div>
            <div className="sm:col-span-2 flex items-center gap-2">
              <input type="checkbox" id="judicializacao" name="judicializacao" checked={form.judicializacao} onChange={handleChange} className="w-4 h-4 accent-blue-600" />
              <label htmlFor="judicializacao" className="text-sm text-gray-700">Judicialização (ordem do Ministério Público para ter cuidador)</label>
            </div>
            {form.judicializacao && (
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Observação sobre judicialização</label>
                <textarea name="obs_judicializacao" value={form.obs_judicializacao} onChange={handleChange} rows={2} className={campoClass} />
              </div>
            )}
          </div>

          {/* Observações */}
          <h2 className="font-semibold text-gray-700 border-b pb-2 pt-2">Observações gerais</h2>
          <textarea name="observacoes" value={form.observacoes} onChange={handleChange} rows={2} className={campoClass} />

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => router.push('/alunos')} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="px-6 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Salvando...' : 'Salvar aluno'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}