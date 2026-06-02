import { AlertCircle, ExternalLink } from 'lucide-react'
import { getSupabaseConfig } from '@/lib/supabase-config'

/** Alerta visível quando .env não está configurado corretamente */
export function SupabaseConfigAlert() {
  const config = getSupabaseConfig()

  if (config.isConfigured) return null

  let motivo = 'Arquivo .env ausente ou variáveis não carregadas.'
  if (config.missing.length > 0) {
    motivo = `Variáveis faltando: ${config.missing.join(', ')}`
  } else if (config.isPlaceholder) {
    motivo = 'Valores ainda são os placeholders do .env.example — substitua pelos dados reais do Supabase.'
  } else if (!config.urlValid) {
    motivo = 'VITE_SUPABASE_URL inválida. Deve ser https://SEU-ID.supabase.co (sem barra no final).'
  }

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-900">
      <div className="flex gap-2">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="space-y-2">
          <p className="font-semibold">Supabase não configurado</p>
          <p>{motivo}</p>
          <ol className="list-decimal space-y-1 pl-4 text-red-800">
            <li>
              Na raiz do projeto (pasta com <code className="rounded bg-red-100 px-1">package.json</code>
              ), crie o arquivo <code className="rounded bg-red-100 px-1">.env</code>
            </li>
            <li>
              Copie de <code className="rounded bg-red-100 px-1">.env.example</code> e preencha com
              URL e chave <strong>anon public</strong> em Supabase → Project Settings → API
            </li>
            <li>
              <strong>Pare</strong> o servidor (<code className="rounded bg-red-100 px-1">Ctrl+C</code>
              ) e rode de novo: <code className="rounded bg-red-100 px-1">npm run dev</code>
            </li>
          </ol>
          <p className="text-xs text-red-700">
            O Vite só lê o .env ao iniciar — salvar o arquivo sem reiniciar não atualiza a conexão.
          </p>
          <a
            href="https://supabase.com/dashboard/project/_/settings/api"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium underline"
          >
            Abrir configurações de API no Supabase
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  )
}
