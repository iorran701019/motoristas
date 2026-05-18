// src/lib/pdfExport.ts
// Instalar: npm install jspdf jspdf-autotable
// Instalar types: npm install --save-dev @types/jspdf

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// ─────────────────────────────────────────────
// TIPOS COMPARTILHADOS
// ─────────────────────────────────────────────

export interface DadosFrequenciaAluno {
  aluno: string
  escola: string
  total_atendimentos: number
  presencas: number
  faltas: number
  percentual_presenca: number
  atendimentos: {
    data: string
    presente: boolean
    justificativa_falta?: string
    tipo_atendimento?: string
    evolucao?: string
    professor?: string
  }[]
}

export interface DadosAtendimentoProfessor {
  professor: string
  escola: string
  atendimentos: {
    aluno: string
    data: string
    presente: boolean
    tipo_atendimento?: string
    evolucao?: string
    habilidades_trabalhadas?: string
  }[]
}

export interface DadosPerfilAluno {
  aluno: {
    nome: string
    data_nascimento?: string
    cpf?: string
    numero_matricula?: string
    tipo_deficiencia?: string
    cid?: string
    tem_laudo?: boolean
    laudo_descricao?: string
    necessidades_especificas?: string
    observacoes?: string
    escola?: string
    ativo?: boolean
    criado_em?: string
  }
  responsaveis: {
    nome: string
    parentesco?: string
    telefone?: string
    telefone_alternativo?: string
    email?: string
    endereco?: string
    responsavel_principal?: boolean
  }[]
  cuidadores: {
    nome: string
    cpf?: string
    telefone?: string
    vinculo?: string
    funcao?: string
    turno?: string
  }[]
  historico: {
    data: string
    presente: boolean
    tipo_atendimento?: string
    evolucao?: string
    habilidades_trabalhadas?: string
    objetivos_proxima_sessao?: string
    observacoes?: string
    professor?: string
  }[]
}

// ─────────────────────────────────────────────
// HELPERS INTERNOS
// ─────────────────────────────────────────────

const AZUL = [30, 64, 175] as [number, number, number]       // blue-700
const CINZA_ESCURO = [55, 65, 81] as [number, number, number]  // gray-700
const CINZA_CLARO = [243, 244, 246] as [number, number, number] // gray-100

function formatarData(dataStr: string): string {
  if (!dataStr) return '—'
  const d = new Date(dataStr)
  if (isNaN(d.getTime())) return dataStr
  return d.toLocaleDateString('pt-BR')
}

function calcularIdade(dataNasc?: string): string {
  if (!dataNasc) return '—'
  const nasc = new Date(dataNasc)
  const hoje = new Date()
  const anos = hoje.getFullYear() - nasc.getFullYear()
  const m = hoje.getMonth() - nasc.getMonth()
  const ajuste = m < 0 || (m === 0 && hoje.getDate() < nasc.getDate()) ? 1 : 0
  return `${anos - ajuste} anos`
}

function rodape(doc: jsPDF, geradoEm: string) {
  const paginas = (doc as any).internal.getNumberOfPages()
  for (let i = 1; i <= paginas; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    const w = doc.internal.pageSize.getWidth()
    const h = doc.internal.pageSize.getHeight()
    doc.text(`Gerado em ${geradoEm} — Página ${i} de ${paginas}`, w / 2, h - 8, { align: 'center' })
    doc.text('Sistema de Gestão da Educação Especial', 14, h - 8)
  }
}

function cabecalho(doc: jsPDF, titulo: string, subtitulo?: string): number {
  const w = doc.internal.pageSize.getWidth()

  // Barra azul no topo
  doc.setFillColor(...AZUL)
  doc.rect(0, 0, w, 28, 'F')

  // Título
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(titulo, 14, 12)

  if (subtitulo) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(subtitulo, 14, 21)
  }

  doc.setTextColor(...CINZA_ESCURO)
  return 36
}

// ─────────────────────────────────────────────
// 1. PDF DE FREQUÊNCIA POR ALUNO
// ─────────────────────────────────────────────

export function exportarFrequenciaAluno(dados: DadosFrequenciaAluno): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const geradoEm = new Date().toLocaleString('pt-BR')
  const w = doc.internal.pageSize.getWidth()

  let y = cabecalho(doc, 'Relatório de Frequência', dados.aluno)

  // Escola
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...CINZA_ESCURO)
  doc.text(`Escola: ${dados.escola}`, 14, y)
  y += 7

  // Cards de resumo
  const cards = [
    { label: 'Total de Atendimentos', valor: String(dados.total_atendimentos), cor: AZUL },
    { label: 'Presenças', valor: String(dados.presencas), cor: [22, 101, 52] as [number, number, number] },
    { label: 'Faltas', valor: String(dados.faltas), cor: [153, 27, 27] as [number, number, number] },
    { label: 'Frequência', valor: `${dados.percentual_presenca.toFixed(1)}%`, cor: dados.percentual_presenca >= 75 ? [22, 101, 52] as [number, number, number] : [153, 27, 27] as [number, number, number] },
  ]

  const cardW = (w - 28 - 9) / 4
  cards.forEach((card, i) => {
    const x = 14 + i * (cardW + 3)
    doc.setFillColor(...CINZA_CLARO)
    doc.roundedRect(x, y, cardW, 18, 2, 2, 'F')
    doc.setFillColor(...card.cor)
    doc.roundedRect(x, y, 3, 18, 1, 1, 'F')
    doc.setFontSize(7)
    doc.setTextColor(...CINZA_ESCURO)
    doc.text(card.label, x + 6, y + 6)
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...card.cor)
    doc.text(card.valor, x + 6, y + 14)
    doc.setFont('helvetica', 'normal')
  })
  y += 26

  // Tabela de atendimentos
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...CINZA_ESCURO)
  doc.text('Histórico de Atendimentos', 14, y)
  y += 4

  autoTable(doc, {
    startY: y,
    head: [['Data', 'Situação', 'Tipo', 'Evolução / Justificativa', 'Professor']],
    body: dados.atendimentos.map(a => [
      formatarData(a.data),
      a.presente ? 'Presente' : 'Falta',
      a.tipo_atendimento || '—',
      a.presente ? (a.evolucao || '—') : (a.justificativa_falta || '—'),
      a.professor || '—',
    ]),
    headStyles: { fillColor: AZUL, textColor: 255, fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8, textColor: CINZA_ESCURO },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 20 },
      2: { cellWidth: 30 },
      3: { cellWidth: 'auto' },
      4: { cellWidth: 35 },
    },
    didDrawCell: (data) => {
      if (data.section === 'body' && data.column.index === 1) {
        const val = data.cell.text[0]
        if (val === 'Presente') {
          doc.setTextColor(22, 101, 52)
        } else {
          doc.setTextColor(153, 27, 27)
        }
      }
    },
    margin: { left: 14, right: 14 },
  })

  rodape(doc, geradoEm)
  doc.save(`frequencia_${dados.aluno.replace(/\s+/g, '_').toLowerCase()}.pdf`)
}

// ─────────────────────────────────────────────
// 2. PDF DE ATENDIMENTOS POR PROFESSOR
// ─────────────────────────────────────────────

export function exportarAtendimentosProfessor(dados: DadosAtendimentoProfessor): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const geradoEm = new Date().toLocaleString('pt-BR')
  const w = doc.internal.pageSize.getWidth()

  let y = cabecalho(doc, 'Relatório de Atendimentos — Professor AEE', dados.professor)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...CINZA_ESCURO)
  doc.text(`Escola: ${dados.escola}    |    Total de registros: ${dados.atendimentos.length}`, 14, y)
  y += 8

  // Totais rápidos
  const presencas = dados.atendimentos.filter(a => a.presente).length
  const faltas = dados.atendimentos.length - presencas
  const alunosUnicos = [...new Set(dados.atendimentos.map(a => a.aluno))].length

  const resumoItems = [
    { label: 'Alunos atendidos', valor: String(alunosUnicos) },
    { label: 'Presenças', valor: String(presencas) },
    { label: 'Faltas', valor: String(faltas) },
    { label: 'Freq. geral', valor: dados.atendimentos.length > 0 ? `${((presencas / dados.atendimentos.length) * 100).toFixed(1)}%` : '—' },
  ]

  const cardW = (w - 28 - 9) / 4
  resumoItems.forEach((item, i) => {
    const x = 14 + i * (cardW + 3)
    doc.setFillColor(...CINZA_CLARO)
    doc.roundedRect(x, y, cardW, 14, 2, 2, 'F')
    doc.setFontSize(7)
    doc.setTextColor(...CINZA_ESCURO)
    doc.text(item.label, x + 5, y + 5)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...AZUL)
    doc.text(item.valor, x + 5, y + 12)
    doc.setFont('helvetica', 'normal')
  })
  y += 22

  autoTable(doc, {
    startY: y,
    head: [['Data', 'Aluno', 'Situação', 'Tipo de Atendimento', 'Habilidades Trabalhadas', 'Evolução']],
    body: dados.atendimentos.map(a => [
      formatarData(a.data),
      a.aluno,
      a.presente ? 'Presente' : 'Falta',
      a.tipo_atendimento || '—',
      a.habilidades_trabalhadas || '—',
      a.evolucao || '—',
    ]),
    headStyles: { fillColor: AZUL, textColor: 255, fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8, textColor: CINZA_ESCURO },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 40 },
      2: { cellWidth: 20 },
      3: { cellWidth: 35 },
      4: { cellWidth: 'auto' },
      5: { cellWidth: 'auto' },
    },
    margin: { left: 14, right: 14 },
  })

  rodape(doc, geradoEm)
  doc.save(`atendimentos_${dados.professor.replace(/\s+/g, '_').toLowerCase()}.pdf`)
}

// ─────────────────────────────────────────────
// 3. PDF DE PERFIL COMPLETO DO ALUNO
// ─────────────────────────────────────────────

export function exportarPerfilAluno(dados: DadosPerfilAluno): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const geradoEm = new Date().toLocaleString('pt-BR')
  const w = doc.internal.pageSize.getWidth()

  let y = cabecalho(doc, 'Perfil do Aluno', dados.aluno.nome)

  // ── Seção: Dados Pessoais ──
  function secao(titulo: string, yPos: number): number {
    doc.setFillColor(...AZUL)
    doc.rect(14, yPos, w - 28, 7, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text(titulo, 17, yPos + 5)
    doc.setTextColor(...CINZA_ESCURO)
    doc.setFont('helvetica', 'normal')
    return yPos + 11
  }

  function campo(label: string, valor: string | undefined, xPos: number, yPos: number, largura = 85): number {
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(107, 114, 128) // gray-500
    doc.text(label.toUpperCase(), xPos, yPos)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...CINZA_ESCURO)
    doc.setFontSize(9)
    const linhas = doc.splitTextToSize(valor || '—', largura)
    doc.text(linhas, xPos, yPos + 5)
    return yPos + 5 + (linhas.length - 1) * 4.5
  }

  function verificarQuebraPagina(yPos: number, minEspaco = 30): number {
    if (yPos > doc.internal.pageSize.getHeight() - 25) {
      doc.addPage()
      return 20
    }
    return yPos
  }

  // Dados pessoais — 2 colunas
  y = secao('DADOS PESSOAIS', y)

  const col1 = 14
  const col2 = w / 2 + 4

  campo('Escola', dados.aluno.escola, col1, y, 80)
  campo('Matrícula', dados.aluno.numero_matricula, col2, y, 80)
  y += 14

  campo('Data de Nascimento', dados.aluno.data_nascimento ? `${formatarData(dados.aluno.data_nascimento)} (${calcularIdade(dados.aluno.data_nascimento)})` : '—', col1, y, 80)
  campo('CPF', dados.aluno.cpf, col2, y, 80)
  y += 14

  campo('Tipo de Deficiência', dados.aluno.tipo_deficiencia, col1, y, 80)
  campo('CID', dados.aluno.cid, col2, y, 80)
  y += 14

  campo('Possui Laudo', dados.aluno.tem_laudo ? 'Sim' : 'Não', col1, y, 80)
  y += 10

  if (dados.aluno.laudo_descricao) {
    campo('Descrição do Laudo', dados.aluno.laudo_descricao, col1, y, w - 28)
    y += 14
  }

  if (dados.aluno.necessidades_especificas) {
    campo('Necessidades Específicas', dados.aluno.necessidades_especificas, col1, y, w - 28)
    y += 14
  }

  if (dados.aluno.observacoes) {
    campo('Observações', dados.aluno.observacoes, col1, y, w - 28)
    y += 14
  }

  y += 4
  y = verificarQuebraPagina(y)

  // ── Seção: Responsáveis ──
  if (dados.responsaveis.length > 0) {
    y = secao('RESPONSÁVEIS', y)

    autoTable(doc, {
      startY: y,
      head: [['Nome', 'Parentesco', 'Telefone', 'Email', 'Principal']],
      body: dados.responsaveis.map(r => [
        r.nome,
        r.parentesco || '—',
        [r.telefone, r.telefone_alternativo].filter(Boolean).join(' / ') || '—',
        r.email || '—',
        r.responsavel_principal ? 'Sim' : 'Não',
      ]),
      headStyles: { fillColor: [96, 165, 250], textColor: 255, fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      margin: { left: 14, right: 14 },
      tableWidth: 'auto',
    })

    y = (doc as any).lastAutoTable.finalY + 8
    y = verificarQuebraPagina(y)
  }

  // ── Seção: Cuidadores ──
  if (dados.cuidadores.length > 0) {
    y = secao('CUIDADORES', y)

    autoTable(doc, {
      startY: y,
      head: [['Nome', 'CPF', 'Telefone', 'Vínculo', 'Função', 'Turno']],
      body: dados.cuidadores.map(c => [
        c.nome,
        c.cpf || '—',
        c.telefone || '—',
        c.vinculo || '—',
        c.funcao || '—',
        c.turno || '—',
      ]),
      headStyles: { fillColor: [96, 165, 250], textColor: 255, fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      margin: { left: 14, right: 14 },
    })

    y = (doc as any).lastAutoTable.finalY + 8
    y = verificarQuebraPagina(y)
  }

  // ── Seção: Histórico de Atendimentos ──
  if (dados.historico.length > 0) {
    y = secao('HISTÓRICO DE ATENDIMENTOS', y)

    const presencasTotal = dados.historico.filter(h => h.presente).length
    const pct = dados.historico.length > 0 ? ((presencasTotal / dados.historico.length) * 100).toFixed(1) : '0.0'

    doc.setFontSize(8)
    doc.setTextColor(...CINZA_ESCURO)
    doc.text(
      `Total: ${dados.historico.length}  |  Presenças: ${presencasTotal}  |  Faltas: ${dados.historico.length - presencasTotal}  |  Frequência: ${pct}%`,
      14,
      y
    )
    y += 6

    autoTable(doc, {
      startY: y,
      head: [['Data', 'Situação', 'Tipo', 'Professor', 'Evolução']],
      body: dados.historico.map(h => [
        formatarData(h.data),
        h.presente ? 'Presente' : 'Falta',
        h.tipo_atendimento || '—',
        h.professor || '—',
        h.evolucao || '—',
      ]),
      headStyles: { fillColor: [96, 165, 250], textColor: 255, fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 20 },
        2: { cellWidth: 30 },
        3: { cellWidth: 35 },
        4: { cellWidth: 'auto' },
      },
      margin: { left: 14, right: 14 },
    })
  }

  rodape(doc, geradoEm)
  doc.save(`perfil_${dados.aluno.nome.replace(/\s+/g, '_').toLowerCase()}.pdf`)
}