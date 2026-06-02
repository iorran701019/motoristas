// Cabeçalhos CORS reutilizados pelas Edge Functions.
// Em produção, troque "*" pela origem do front (ex.: https://rotas-sme.vercel.app).
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
