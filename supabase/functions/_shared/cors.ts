// Cabeçalhos CORS reutilizados pelas Edge Functions.
// Allowlist de origens permitidas (nunca usa '*'):
//   - produção: ALLOWED_ORIGIN, com fallback no domínio Netlify;
//   - Vite dev: http://localhost:5173 e http://127.0.0.1:5173;
//   - extras opcionais: ALLOWED_ORIGINS (lista separada por vírgula).
// A origem do request só é refletida se estiver na allowlist; caso contrário,
// cai na origem de produção (não reflete origem desconhecida).
const PROD_ORIGIN =
  Deno.env.get('ALLOWED_ORIGIN') ?? 'https://sme-pmbm-motoristas.netlify.app'

const DEV_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
]

const EXTRA_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

const ALLOWLIST = new Set<string>([PROD_ORIGIN, ...DEV_ORIGINS, ...EXTRA_ORIGINS])

/**
 * Monta os headers CORS a partir da origem do request.
 * Reflete a origem só quando está na allowlist; senão usa a de produção.
 */
export function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin') ?? ''
  const allowOrigin = ALLOWLIST.has(origin) ? origin : PROD_ORIGIN
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    // Resposta varia conforme a origem refletida — evita cache servir CORS errado.
    Vary: 'Origin',
  }
}
