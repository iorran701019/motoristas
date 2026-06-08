/** Verifica se as variáveis do Supabase foram carregadas pelo Vite */
export function getSupabaseConfig() {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim()
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

  const missing: string[] = []
  if (!url) missing.push('VITE_SUPABASE_URL')
  if (!anonKey) missing.push('VITE_SUPABASE_ANON_KEY')

  const isPlaceholder =
    url === 'https://seu-projeto.supabase.co' ||
    url === 'https://placeholder.supabase.co' ||
    anonKey === 'sua-chave-anon-aqui' ||
    anonKey === 'placeholder-key'

  const urlValid =
    !!url &&
    (url.startsWith('https://') && url.includes('.supabase.co'))

  return {
    url: url ?? '',
    anonKey: anonKey ?? '',
    missing,
    isPlaceholder,
    urlValid,
    isConfigured: missing.length === 0 && !isPlaceholder && urlValid,
  }
}
