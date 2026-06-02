import { useMemo, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { ArrowUpDown, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { formatDateBR, formatTime, getStatusClasses } from '@/lib/utils'
import type { RotaMotorista } from '@/types/rota'

interface RotasTableProps {
  rotas: RotaMotorista[]
  onRowClick?: (rota: RotaMotorista) => void
}

/** Tabela de rotas com busca, ordenação e filtros */
export function RotasTable({ rotas, onRowClick }: RotasTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'data', desc: true }])
  const [globalFilter, setGlobalFilter] = useState('')
  const [filtroData, setFiltroData] = useState('')
  const [filtroMotorista, setFiltroMotorista] = useState('todos')

  const motoristas = useMemo(
    () => [...new Set(rotas.map((r) => r.motorista))].sort(),
    [rotas]
  )

  const dadosFiltrados = useMemo(() => {
    return rotas.filter((r) => {
      if (filtroData && r.data !== filtroData) return false
      if (filtroMotorista !== 'todos' && r.motorista !== filtroMotorista) return false
      return true
    })
  }, [rotas, filtroData, filtroMotorista])

  const columns = useMemo<ColumnDef<RotaMotorista>[]>(
    () => [
      {
        accessorKey: 'data',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Data
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => formatDateBR(row.original.data),
      },
      { accessorKey: 'motorista', header: 'Motorista' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge className={getStatusClasses(row.original.status)}>{row.original.status}</Badge>
        ),
      },
      { accessorKey: 'placa_veiculo', header: 'Placa' },
      { accessorKey: 'destino_principal', header: 'Destino' },
      {
        accessorKey: 'horario_saida',
        header: 'Saída',
        cell: ({ row }) => formatTime(row.original.horario_saida),
      },
      {
        accessorKey: 'horario_retorno',
        header: 'Retorno',
        cell: ({ row }) => formatTime(row.original.horario_retorno),
      },
      { accessorKey: 'qtd_passageiros', header: 'Pass.' },
      { accessorKey: 'responsavel_solicitacao', header: 'Responsável' },
    ],
    []
  )

  const table = useReactTable({
    data: dadosFiltrados,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, _columnId, filterValue) => {
      const search = String(filterValue).toLowerCase()
      const r = row.original
      return (
        r.motorista.toLowerCase().includes(search) ||
        r.destino_principal.toLowerCase().includes(search) ||
        r.status.toLowerCase().includes(search) ||
        r.placa_veiculo.toLowerCase().includes(search) ||
        r.rota_descricao.toLowerCase().includes(search) ||
        r.responsavel_solicitacao.toLowerCase().includes(search)
      )
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Registros de Rotas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por motorista, destino, placa..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9"
            />
          </div>

          <div>
            <Label htmlFor="filtro-data" className="sr-only">
              Filtrar por data
            </Label>
            <Input
              id="filtro-data"
              type="date"
              value={filtroData}
              onChange={(e) => setFiltroData(e.target.value)}
              placeholder="Filtrar data"
            />
          </div>

          <div>
            <Select value={filtroMotorista} onValueChange={setFiltroMotorista}>
              <SelectTrigger>
                <SelectValue placeholder="Motorista" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os motoristas</SelectItem>
                {motoristas.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-md border">
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
                  <tr
                    key={row.id}
                    className="border-t transition-colors hover:bg-muted/30 cursor-pointer"
                    onClick={() => onRowClick?.(row.original)}
                  >
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

        <p className="text-xs text-muted-foreground">
          {table.getRowModel().rows.length} registro(s) exibido(s)
        </p>
      </CardContent>
    </Card>
  )
}
