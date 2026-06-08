import { AlertCircle } from 'lucide-react'
import { RotaForm } from '@/components/rotas/RotaForm'
import { SupabaseConfigAlert } from '@/components/SupabaseConfigAlert'
import { useRotasContext } from '@/context/RotasContext'
import { useCadastrosContext } from '@/context/CadastrosContext'
import { getSupabaseConfig } from '@/lib/supabase-config'

/** Tela 1 — Cadastro de Rotas */
export function CadastroPage() {
  const { loading, error } = useRotasContext()
  const { motoristas, veiculos } = useCadastrosContext()

  const configOk = getSupabaseConfig().isConfigured

  return (
    <div className="space-y-4">
      <SupabaseConfigAlert />

      {error && configOk && (
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

      <RotaForm motoristas={motoristas} veiculos={veiculos} />
    </div>
  )
}
