// Edge Function: admin-users
//
// Gestão de usuários restrita a administradores. Usa a Service Role Key (que
// NUNCA pode ir para o front) para listar/criar usuários e resetar senhas.
//
// Fluxo de segurança:
//   1. Identifica o chamador pelo JWT enviado no header Authorization.
//   2. Confirma que esse chamador tem papel 'admin' em app_user_roles.
//   3. Só então executa a ação pedida com privilégios de service role.
//
// Ações (body JSON): { action: 'list' | 'create' | 'reset_password', ...payload }
//
// Deploy:
//   supabase functions deploy admin-users
// As variáveis SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são injetadas
// automaticamente pelo runtime do Supabase.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  action: 'list' | 'create' | 'reset_password'
  email?: string
  password?: string
  nomeCompleto?: string
  matricula?: string
  isAdmin?: boolean
  userId?: string
  newPassword?: string
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Método não permitido.' }, 405)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')

  if (!supabaseUrl || !serviceRoleKey || !anonKey) {
    return json({ error: 'Variáveis de ambiente do Supabase ausentes na função.' }, 500)
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return json({ error: 'Não autenticado.' }, 401)
  }

  // Cliente com o JWT do chamador — só para identificar quem está chamando.
  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  })

  const {
    data: { user: caller },
    error: callerError,
  } = await callerClient.auth.getUser()

  if (callerError || !caller) {
    return json({ error: 'Sessão inválida.' }, 401)
  }

  // Cliente service role — ignora RLS, usado para checar papel e agir.
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: roleRow } = await admin
    .from('app_user_roles')
    .select('role')
    .eq('user_id', caller.id)
    .maybeSingle()

  if (roleRow?.role !== 'admin') {
    return json({ error: 'Acesso restrito a administradores.' }, 403)
  }

  let body: RequestBody
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Corpo da requisição inválido.' }, 400)
  }

  try {
    switch (body.action) {
      case 'list': {
        const { data, error } = await admin.auth.admin.listUsers()
        if (error) throw error

        const { data: roles } = await admin
          .from('app_user_roles')
          .select('user_id, role')
        const adminIds = new Set(
          (roles ?? []).filter((r) => r.role === 'admin').map((r) => r.user_id)
        )

        const users = data.users.map((u) => ({
          id: u.id,
          email: u.email ?? '',
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at ?? null,
          is_admin: adminIds.has(u.id),
        }))

        return json(users)
      }

      case 'create': {
        // Validar TUDO antes do createUser: se algo falhar aqui, nenhum usuário é
        // criado no auth, então não há perfil órfão nem auth.user sem app_user_profiles.
        if (!body.email || !body.password) {
          return json({ error: 'E-mail e senha são obrigatórios.' }, 400)
        }
        if (body.password.length < 6) {
          return json({ error: 'A senha deve ter ao menos 6 caracteres.' }, 400)
        }
        const nomeCompleto = (body.nomeCompleto ?? '').trim()
        if (nomeCompleto.length < 3) {
          return json({ error: 'O nome completo deve ter ao menos 3 caracteres.' }, 400)
        }
        const matricula = (body.matricula ?? '').trim()
        if (!/^[0-9]{6}$/.test(matricula)) {
          return json({ error: 'A matrícula deve ter exatamente 6 dígitos numéricos.' }, 400)
        }

        const { data: created, error } = await admin.auth.admin.createUser({
          email: body.email,
          password: body.password,
          email_confirm: true,
          // Espelha nome/matrícula no user_metadata para o front ler direto do
          // AuthContext (Bloco 3) sem consultar app_user_profiles.
          user_metadata: { nome_completo: nomeCompleto, matricula },
        })
        if (error) throw error

        const role = body.isAdmin ? 'admin' : 'operador'
        const { error: roleError } = await admin
          .from('app_user_roles')
          .upsert({ user_id: created.user.id, role }, { onConflict: 'user_id' })
        if (roleError) throw roleError

        // Perfil persistido via service role (ignora RLS). Mesmo padrão de upsert
        // do app_user_roles. Se falhar, o usuário ficou sem perfil — avisamos no erro.
        const { error: profileError } = await admin
          .from('app_user_profiles')
          .upsert(
            { user_id: created.user.id, nome_completo: nomeCompleto, matricula },
            { onConflict: 'user_id' }
          )
        if (profileError) {
          return json(
            {
              error: `Usuário criado, mas falhou ao gravar o perfil: ${profileError.message}. Edite o usuário para corrigir nome/matrícula.`,
            },
            500
          )
        }

        return json({ ok: true })
      }

      case 'reset_password': {
        if (!body.userId || !body.newPassword) {
          return json({ error: 'Usuário e nova senha são obrigatórios.' }, 400)
        }
        if (body.newPassword.length < 6) {
          return json({ error: 'A senha deve ter ao menos 6 caracteres.' }, 400)
        }

        const { error } = await admin.auth.admin.updateUserById(body.userId, {
          password: body.newPassword,
        })
        if (error) throw error

        return json({ ok: true })
      }

      default:
        return json({ error: 'Ação desconhecida.' }, 400)
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro inesperado.'
    return json({ error: message }, 500)
  }
})
