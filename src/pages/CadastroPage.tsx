import { useMemo } from 'react'
import { AlertCircle } from 'lucide-react'
import { RotaForm } from '@/components/rotas/RotaForm'
import { useRotasContext } from '@/context/RotasContext'

/** Tela 1 — Cadastro de Rotas */
export function CadastroPage() {
  const { rotas, loading, error } = useRotasContext()

  const placasExistentes = useMemo(
    () => rotas.map((r) => r.placa_veiculo),
    [rotas]
  )

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            Não foi possível conectar ao Supabase: {error}. Verifique o arquivo{' '}
            <code className="rounded bg-amber-100 px-1">.env</code> e a migration do banco.
          </span>
        </div>
      )}

      {loading && !error ? (
        <p className="text-sm text-muted-foreground">Carregando dados...</p>
      ) : null}

      <RotaForm placasExistentes={placasExistentes} />
    </div>
  )
}
