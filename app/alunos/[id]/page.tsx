'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Aluno = {
  id: string
  nome: string
  numero_matricula: string
  data_nascimento: string
  cpf: string
  tipo_deficiencia: string
  cid: string
  tem_laudo: boolean
  laudo_descricao: string
  necessidades_especificas: string
  observacoes: string
  escola_id: string
  escolas?: { nome: string }
  ano_escolar?: string
  turno?: string
  data_avaliacao_cemae?: string
  status_cemae?: string
  prioridade_cuidador?: string
  judicializacao?: boolean
  obs_judicializacao?: string
}

type Responsavel = {
  id: string
  nome: string
  parentesco: string
  telefone: string
  telefone_alternativo: string
  email: string
  responsavel_principal: boolean
}

type Cuidador = {
  id: string
  nome: string
  cpf: string
  telefone: string
  vinculo: string
  funcao: string
  turno: string
  created_at: string
}

type Atendimento = {
  id: string
  data: string
  presente: boolean
  justificativa_falta: string
  tipo_atendimento: string
  habilidades_trabalhadas: string
  evolucao: string
  recursos_utilizados: string
  objetivos_proxima_sessao: string
  professores_aee?: { nome: string }
}

function tempoDeEspera(dataInicio: string): string {
  const inicio = new Date(dataInicio)
  const hoje = new Date()
  const diffMs = hoje.getTime() - inicio.getTime()
  const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (dias < 30) return `${dias} dia(s)`
  const meses = Math.floor(dias / 30)
  if (meses < 12) return `${meses} mês(es)`
  const anos = Math.floor(meses / 12)
  const mesesRestantes = meses % 12
  return mesesRestantes > 0 ? `${anos} ano(s) e ${mesesRestantes} mês(es)` : `${anos} ano(s)`
}

function calcularIdade(dataNascimento: string): string {
  const nasc = new Date(dataNascimento)
  const hoje = new Date()
  let idade = hoje.getFullYear() - nasc.getFullYear()
  const m = hoje.getMonth() - nasc.getMonth()
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--
  return `${idade} anos`
}

const prioridadeConfig: Record<string, { cor: string; label: string }> = {
  urgentissimo: { cor: 'bg-red-500', label: 'Urgentíssimo' },
  urgente: { cor: 'bg-yellow-400', label: 'Urgente' },
  desejavel: { cor: 'bg-green-500', label: 'Desejável' },
}

export default function PerfilAluno() {
  const { id } = useParams()
  const router = useRouter()
  const [aluno, setAluno] = useState<Aluno | null>(null)
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([])
  const [cuidadores, setCuidadores] = useState<Cuidador[]>([])
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([])
  const [loading, setLoading] = useState(true)
  const [observacoes, setObservacoes] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [salvoOk, setSalvoOk] = useState(false)

  useEffect(() => {
    if (id) carregarTudo()
  }, [id])

  async function carregarTudo() {
    setLoading(true)
    const [{ data: alunoData }, { data: respData }, { data: cuidData }, { data: atendData }] =
      await Promise.all([
        supabase.from('alunos').select('*, escolas(nome)').eq('id', id).single(),
        supabase.from('responsaveis').select('*').eq('aluno_id', id).order('responsavel_principal', { ascending: false }),
        supabase.from('cuidadores').select('*').eq('aluno_id', id).eq('ativo', true),
        supabase.from('atendimentos').select('*, professores_aee(nome)').eq('aluno_id', id).order('data', { ascending: false }).limit(20),
      ])
    if (alunoData) {
      setAluno(alunoData)
      setObservacoes(alunoData.observacoes || '')
    }
    setResponsaveis(respData || [])
    setCuidadores(cuidData || [])
    setAtendimentos(atendData || [])
    setLoading(false)
  }

  async function salvarObservacoes() {
    setSalvando(true)
    await supabase.from('alunos').update({ observacoes }).eq('id', id)
    setSalvando(false)
    setSalvoOk(true)
    setTimeout(() => setSalvoOk(false), 2500)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-lg">Carregando perfil...</p>
      </div>
    )
  }

  if (!aluno) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-red-500 text-lg">Aluno não encontrado.</p>
      </div>
    )
  }

  const presencas = atendimentos.filter((a) => a.presente).length
  const faltas = atendimentos.filter((a) => !a.presente).length
  const totalSessoes = atendimentos.length
  const percFreq = totalSessoes > 0 ? Math.round((presencas / totalSessoes) * 100) : null
  const prio = aluno.prioridade_cuidador ? prioridadeConfig[aluno.prioridade_cuidador] : null

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="text-blue-600 hover:underline text-sm flex items-center gap-1">
            ← Voltar
          </button>
          <button onClick={() => window.print()} className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm px-4 py-2 rounded">
            🖨️ Imprimir
          </button>
        </div>

        {/* Dados pessoais */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{aluno.nome}</h1>
              <p className="text-gray-500 text-sm mt-1">
                Matrícula: <span className="font-medium">{aluno.numero_matricula || '—'}</span>
                {aluno.escolas?.nome && (
                  <> · Escola: <span className="font-medium">{aluno.escolas.nome}</span></>
                )}
              </p>
            </div>
            <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
              {aluno.tipo_deficiencia || 'Deficiência não informada'}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <Info label="Data de nascimento" value={aluno.data_nascimento ? `${new Date(aluno.data_nascimento).toLocaleDateString('pt-BR')} (${calcularIdade(aluno.data_nascimento)})` : '—'} />
            <Info label="CPF" value={aluno.cpf || '—'} />
            <Info label="CID" value={aluno.cid || '—'} />
            <Info label="Ano escolar" value={aluno.ano_escolar || '—'} />
            <Info label="Turno" value={aluno.turno || '—'} />
            <Info label="Laudo" value={aluno.tem_laudo ? '✅ Possui laudo' : '❌ Sem laudo'} />
            {aluno.laudo_descricao && (
              <div className="col-span-2">
                <Info label="Descrição do laudo" value={aluno.laudo_descricao} />
              </div>
            )}
            {aluno.necessidades_especificas && (
              <div className="col-span-3">
                <Info label="Necessidades específicas" value={aluno.necessidades_especificas} />
              </div>
            )}
          </div>
        </div>

        {/* CEMAE */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">🏫 Avaliação CEMAE / Cuidador</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <Info label="Data de avaliação CEMAE" value={aluno.data_avaliacao_cemae ? new Date(aluno.data_avaliacao_cemae).toLocaleDateString('pt-BR') : '—'} />
            <Info label="Status CEMAE" value={aluno.status_cemae || '—'} />
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Prioridade</p>
              {prio ? (
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-block w-3 h-3 rounded-full ${prio.cor}`} />
                  <span className="text-gray-700 font-medium">{prio.label}</span>
                </div>
              ) : (
                <p className="text-gray-700 font-medium">—</p>
              )}
            </div>
            <div className="col-span-2 md:col-span-3 flex items-center gap-2">
              <span className={`inline-block w-3 h-3 rounded-full ${aluno.judicializacao ? 'bg-purple-500' : 'bg-gray-300'}`} />
              <span className="text-sm text-gray-700 font-medium">
                Judicialização: {aluno.judicializacao ? 'Sim (ordem do Ministério Público)' : 'Não'}
              </span>
            </div>
            {aluno.obs_judicializacao && (
              <div className="col-span-3">
                <Info label="Obs. judicialização" value={aluno.obs_judicializacao} />
              </div>
            )}
          </div>
        </div>

        {/* Responsáveis */}
        <Section title="👨‍👩‍👧 Responsáveis" count={responsaveis.length}>
          {responsaveis.length === 0 ? (
            <p className="text-gray-400 text-sm">Nenhum responsável cadastrado.</p>
          ) : (
            <div className="space-y-3">
              {responsaveis.map((r) => (
                <div key={r.id} className="flex items-start justify-between border rounded-lg p-4">
                  <div>
                    <p className="font-medium text-gray-800">
                      {r.nome}
                      {r.responsavel_principal && (
                        <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Principal</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">{r.parentesco}</p>
                    <p className="text-sm text-gray-500">{r.telefone}{r.telefone_alternativo ? ` / ${r.telefone_alternativo}` : ''}</p>
                    {r.email && <p className="text-sm text-gray-500">{r.email}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Agentes de Apoio */}
        <Section title="🤝 Agentes de Apoio" count={cuidadores.length}>
          {cuidadores.length === 0 ? (
            <p className="text-gray-400 text-sm">Nenhum agente de apoio ativo vinculado.</p>
          ) : (
            <div className="space-y-3">
              {cuidadores.map((c) => (
                <div key={c.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{c.nome}</p>
                      <p className="text-sm text-gray-500">{c.funcao} · {c.turno} · {c.vinculo}</p>
                      <p className="text-sm text-gray-500">{c.telefone}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Tempo vinculado</p>
                      <p className="text-sm font-semibold text-orange-600">
                        {c.created_at ? tempoDeEspera(c.created_at) : '—'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Observações */}
        <Section title="📝 Observações gerais">
          <textarea
            className="w-full border rounded-lg p-3 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
            rows={4}
            placeholder="Anotações gerais sobre o aluno..."
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
          />
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={salvarObservacoes}
              disabled={salvando}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded disabled:opacity-50"
            >
              {salvando ? 'Salvando...' : 'Salvar observações'}
            </button>
            {salvoOk && <span className="text-green-600 text-sm">✅ Salvo com sucesso!</span>}
          </div>
        </Section>

        {/* Histórico de atendimentos */}
        <Section title="📋 Histórico de atendimentos" count={totalSessoes}>
          {totalSessoes > 0 && (
            <div className="flex gap-4 mb-4 text-sm">
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">✅ {presencas} presenças</span>
              <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full">❌ {faltas} faltas</span>
              <span className={`px-3 py-1 rounded-full font-semibold ${percFreq !== null && percFreq >= 75 ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                {percFreq}% de frequência
              </span>
            </div>
          )}
          {atendimentos.length === 0 ? (
            <p className="text-gray-400 text-sm">Nenhum atendimento registrado.</p>
          ) : (
            <div className="space-y-3">
              {atendimentos.map((a) => (
                <div key={a.id} className={`border-l-4 rounded-lg p-4 ${a.presente ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-gray-800">
                      {new Date(a.data).toLocaleDateString('pt-BR')}
                      <span className="ml-2 text-sm font-normal text-gray-500">
                        · {a.professores_aee?.nome || 'Professor não informado'}
                      </span>
                    </p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${a.presente ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                      {a.presente ? 'Presente' : 'Falta'}
                    </span>
                  </div>
                  {!a.presente && a.justificativa_falta && (
                    <p className="text-sm text-red-600">Justificativa: {a.justificativa_falta}</p>
                  )}
                  {a.presente && (
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      {a.habilidades_trabalhadas && <p><span className="font-medium">Habilidades:</span> {a.habilidades_trabalhadas}</p>}
                      {a.evolucao && <p><span className="font-medium">Evolução:</span> {a.evolucao}</p>}
                      {a.recursos_utilizados && <p><span className="font-medium">Recursos:</span> {a.recursos_utilizados}</p>}
                      {a.objetivos_proxima_sessao && <p><span className="font-medium">Próxima sessão:</span> {a.objetivos_proxima_sessao}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Section>

      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-gray-700 font-medium">{value}</p>
    </div>
  )
}

function Section({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        {title}
        {count !== undefined && (
          <span className="text-sm font-normal bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{count}</span>
        )}
      </h2>
      {children}
    </div>
  )
}