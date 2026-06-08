import { createClient } from '@supabase/supabase-js'
import { getSupabaseConfig } from './supabase-config'

const config = getSupabaseConfig()

if (!config.isConfigured) {
  console.error(
    '[Supabase] Configuração inválida ou ausente.',
    config.missing.length
      ? `Variáveis faltando: ${config.missing.join(', ')}`
      : 'Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env',
    '\n→ Copie .env.example para .env, preencha com dados do Supabase e reinicie: npm run dev'
  )
}

/**
 * Cliente Supabase singleton.
 * Preparado para injetar sessão de autenticação futura via supabase.auth.
 */
export const supabase = createClient(
  config.url || 'https://invalid.supabase.co',
  config.anonKey || 'invalid-key'
)

export { getSupabaseConfig }

export const TABLE_ROTAS = 'rotas_motoristas'
