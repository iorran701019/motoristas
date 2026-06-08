import { useMemo, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuditLogs } from '@/hooks/useAuditLogs'
import { formatDateBR } from '@/lib/utils'
import type { AuditLog } from '@/types/rota'

/** Rótulos legíveis em pt-BR para os códigos de ação do audit log */
const ACTION_LABELS: Record<string, string> = {
  'motorista.created': 'Criou motorista',
  'motorista.deleted': 'Excluiu motorista',
  'rota.created': 'Criou rota',
  'rota.deleted': 'Excluiu rota',
  'veiculo.created': 'Criou veículo',
  'veiculo.deleted': 'Excluiu veículo',
  'auth.login': 'Login',
}

/** Traduz o código de ação; se vier um código fora do map, mostra o código cru. */
function actionLabel(action: string): string {
  return ACTION_LABELS[action] ?? action
}

/** Converte um timestamp ISO para data local YYYY-MM-DD (para comparar com filtros de período). */
function localDateISO(ts: string): string {
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * Resumo curto e legível do payload JSONB, por entidade.
 * Evita despejar o JSON cru na célula; mostra só os campos mais úteis.
 */
function resumoDetails(log: AuditLog): string {
  const d = log.details
  if (!d) return '—'

  const parts: string[] = []
  const get = (key: string) => {
    const v = d[key]
    return v == null || v === '' ? null : String(v)
  }

  switch (log.entity) {
    case 'motorista': {
      const nome = get('nome_completo')
      const matricula = get('matricula')
      if (nome) parts.push(nome)
      if (matricula) parts.push(`mat. ${matricula}`)
      break
    }
    case 'rota': {
      const motorista = get('motorista')
      const destino = get('destino_principal')
      const data = get('data')
      if (motorista) parts.push(motorista)
      if (destino) parts.push(destino)
      if (data) parts.push(formatDateBR(data))
      break
    }
    case 'veiculo': {
      const placa = get('placa')
      const modelo = get('modelo')
      if (placa) parts.push(placa)
      if (modelo) parts.push(modelo)
      break
    }
  }

  return parts.length ? parts.join(' · ') : '—'
}

/** Tabela paginada do relatório de auditoria (admin-only via rota /admin) */
export function AuditLogTable() {
  const { logs, loading, error } = useAuditLogs()

  const [sorting, setSorting] = useState<SortingState>([{ id: 'created_at', desc: true }])
  const [filtroUsuario, setFiltroUsuario] = useState('todos')
  const [filtroAcao, setFiltroAcao] = useState('todas')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')

  const usuarios = useMemo(
    () =>
      Array.from(
        new Set(logs.map((l) => l.actor_email).filter((e): e is string => !!e))
      ).sort(),
    [logs]
  )

  const acoes = useMemo(
    () => Array.from(new Set(logs.map((l) => l.action))).sort(),
    [logs]
  )

  const dadosFiltrados = useMemo(() => {
    return logs.filter((l) => {
      if (filtroUsuario !== 'todos' && l.actor_email !== filtroUsuario) return false
      if (filtroAcao !== 'todas' && l.action !== filtroAcao) return false
      const dia = localDateISO(l.created_at)
      if (dataInicio && dia < dataInicio) return false
      if (dataFim && dia > dataFim) return false
      return true
    })
  }, [logs, filtroUsuario, filtroAcao, dataInicio, dataFim])

  const columns = useMemo<ColumnDef<AuditLog>[]>(
    () => [
      {
        accessorKey: 'created_at',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Data/hora
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => new Date(row.original.created_at).toLocaleString('pt-BR'),
      },
      {
        accessorKey: 'actor_email',
        header: 'Usuário',
        cell: ({ getValue }) => (getValue() as string | null) ?? '—',
      },
      {
        accessorKey: 'action',
        header: 'Ação',
        cell: ({ row }) => actionLabel(row.original.action),
      },
      {
        id: 'detalhes',
        header: 'Detalhes',
        cell: ({ row }) => resumoDetails(row.original),
      },
    ],
    []
  )

  const table = useReactTable({
    data: dadosFiltrados,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } },
  })

  if (loading) {
    return <p className="text-sm text-muted-foreground">Carregando...</p>
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label>Usuário</Label>
          <Select value={filtroUsuario} onValueChange={setFiltroUsuario}>
            <SelectTrigger>
              <SelectValue placeholder="Usuário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os usuários</SelectItem>
              {usuarios.map((u) => (
                <SelectItem key={u} value={u}>
                  {u}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Ação</Label>
          <Select value={filtroAcao} onValueChange={setFiltroAcao}>
            <SelectTrigger>
              <SelectValue placeholder="Ação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as ações</SelectItem>
              {acoes.map((a) => (
                <SelectItem key={a} value={a}>
                  {actionLabel(a)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="audit-data-inicio">Data início</Label>
          <Input
            id="audit-data-inicio"
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="audit-data-fim">Data fim</Label>
          <Input
            id="audit-data-fim"
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
          />
        </div>
      </div>

      <div className="tabela-scroll overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="whitespace-nowrap px-4 py-3 text-left font-medium text-muted-foreground"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Nenhum registro encontrado.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-t transition-colors hover:bg-muted/30">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="whitespace-nowrap px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {table.getPageCount() > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Anterior
            </Button>
            <span className="text-xs text-muted-foreground">
              Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Próxima
            </Button>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          {table.getFilteredRowModel().rows.length} registro(s) exibido(s)
        </p>
      </div>
    </div>
  )
}
