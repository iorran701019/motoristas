// Cabeçalhos CORS reutilizados pelas Edge Functions.
// A origem permitida vem da env ALLOWED_ORIGIN; sem ela, usa o domínio
// Netlify de produção como fallback.
const allowedOrigin =
  Deno.env.get('ALLOWED_ORIGIN') ?? 'https://sme-pmbm-motoristas.netlify.app'

export const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigin,
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
