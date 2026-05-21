'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Agente = {
  id: string
  nome: string
  cpf?: string
  matricula?: string
  telefone?: string
  funcao?: string
  turno?: string
  regime_contratacao?: string
  data_inicio_contrato?: string
  data_fim_contrato?: string
  observacoes?: string
  polo?: number
  coordenadora_polo?: string
  aluno_id?: string
}

type Aluno = {
  id: string
  nome: string
  tipo_deficiencia?: string
  cid?: string
  ano_escolar?: string
  turno?: string
  numero_matricula?: string
  escolas?: { nome: string } | { nome: string }[] | null
}

type Escola = {
  id: string
  nome: string
}

function calcularTempo(dataInicio: string): string {
  const inicio = new Date(dataInicio)
  const hoje = new Date()
  const dias = Math.floor((hoje.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24))
  if (dias < 30) return `${dias} dia(s)`
  const meses = Math.floor(dias / 30)
  if (meses < 12) return `${meses} mês(es)`
  const anos = Math.floor(meses / 12)
  const mesesRestantes = meses % 12
  return mesesRestantes > 0 ? `${anos} ano(s) e ${mesesRestantes} mês(es)` : `${anos} ano(s)`
}

export default function PerfilAgente() {
  const { id } = useParams()
  const router = useRouter()
  const [agente, setAgente] = useState<Agente | null>(null)
  const [aluno, setAluno] = useState<Aluno | null>(null)
  const [escolasAtuacao, setEscolasAtuacao] = useState<Escola[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) carregar()
  }, [id])

  const carregar = async () => {
    setLoading(true)

    const { data: ag } = await supabase
      .from('cuidadores')
      .select('*')
      .eq('id', id)
      .single()

    if (!ag) { setLoading(false); return }
    setAgente(ag)

    // Aluno vinculado
    if (ag.aluno_id) {
      const { data: al } = await supabase
        .from('alunos')
        .select('id, nome, tipo_deficiencia, cid, ano_escolar, turno, numero_matricula, escolas(nome)')
        .eq('id', ag.aluno_id)
        .single()
      setAluno(al)
    }

    // Escolas de atuação
    const { data: ce } = await supabase
      .from('cuidadores_escolas')
      .select('escola_id, escolas(id, nome)')
      .eq('cuidador_id', id)
    setEscolasAtuacao((ce || []).map((x: any) => x.escolas).filter(Boolean))

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Carregando perfil...</p>
      </div>
    )
  }

  if (!agente) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-red-500">Agente de apoio não encontrado.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

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
              <h1 className="text-2xl font-bold text-gray-800">{agente.nome}</h1>
              <p className="text-gray-500 text-sm mt-1">
                {agente.funcao || 'Agente de Apoio'}
                {agente.matricula && <> · Matrícula: <span className="font-medium">{agente.matricula}</span></>}
              </p>
            </div>
            <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
              {agente.turno || 'Turno não informado'}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <Info label="CPF" value={agente.cpf || '—'} />
            <Info label="Telefone" value={agente.telefone || '—'} />
            <Info label="Regime" value={agente.regime_contratacao || '—'} />
            <Info
              label="Início do contrato"
              value={agente.data_inicio_contrato
                ? new Date(agente.data_inicio_contrato).toLocaleDateString('pt-BR')
                : '—'}
            />
            <Info
              label="Fim do contrato"
              value={agente.data_fim_contrato
                ? new Date(agente.data_fim_contrato).toLocaleDateString('pt-BR')
                : '—'}
            />
            <Info
              label="Tempo de contrato"
              value={agente.data_inicio_contrato ? calcularTempo(agente.data_inicio_contrato) : '—'}
            />
          </div>
        </div>

        {/* Polo */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">📍 Polo e Coordenação</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <Info label="Polo" value={agente.polo ? `Polo ${agente.polo}` : '—'} />
            <Info label="Coordenadora responsável" value={agente.coordenadora_polo || '—'} />
          </div>

          {escolasAtuacao.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Escola(s) onde está atuando</p>
              <div className="flex flex-wrap gap-2">
                {escolasAtuacao.map((e) => (
                  <span key={e.id} className="bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">
                    🏫 {e.nome}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Aluno acompanhado */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">🎓 Aluno Acompanhado</h2>
          {!aluno ? (
            <p className="text-gray-400 text-sm">Nenhum aluno vinculado.</p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-800 text-lg">{aluno.nome}</p>
                  <p className="text-gray-500 text-sm">
                    Matrícula: {aluno.numero_matricula || '—'}
                    {aluno.escolas && <> · {Array.isArray(aluno.escolas) ? aluno.escolas[0]?.nome : (aluno.escolas as {nome:string}).nome}</>}
                  </p>
                </div>
                <a
                  href={`/alunos/${aluno.id}`}
                  className="text-blue-600 hover:underline text-xs mt-1"
                >
                  Ver perfil completo →
                </a>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <Info label="Deficiência" value={aluno.tipo_deficiencia || '—'} />
                <Info label="CID" value={aluno.cid || '—'} />
                <Info label="Ano escolar" value={aluno.ano_escolar || '—'} />
                <Info label="Turno" value={aluno.turno || '—'} />
              </div>
            </div>
          )}
        </div>

        {/* Observações */}
        {agente.observacoes && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">📝 Observações</h2>
            <p className="text-gray-700 text-sm whitespace-pre-wrap">{agente.observacoes}</p>
          </div>
        )}

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