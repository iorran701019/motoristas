-- V9: perfil de usuário (nome completo + matrícula)
--
-- Rode no SQL Editor do Supabase APÓS as migrations 001 a 008.
-- Bloco 1 de 3: apenas a fundação (tabela + RLS). A Edge Function e o
-- frontend que populam/exibem esses dados vêm depois.
-- Idempotente: pode ser reexecutada sem efeitos colaterais.

-- 1) Tabela de perfil, 1:1 com auth.users
CREATE TABLE IF NOT EXISTS public.app_user_profiles (
  user_id       UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_completo TEXT NOT NULL,
  matricula     TEXT NOT NULL CHECK (matricula ~ '^[0-9]{6}$'), -- 6 dígitos; validação forte na app/Edge Function
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) RLS
ALTER TABLE public.app_user_profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: o próprio usuário lê seu perfil OU admin lê qualquer um.
-- (policies permissivas combinam com OR; aqui é explícito numa só policy.)
DROP POLICY IF EXISTS "Perfil leitura própria ou admin" ON public.app_user_profiles;
CREATE POLICY "Perfil leitura própria ou admin"
  ON public.app_user_profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

-- INSERT: somente admin. Perfis nascem no cadastro de usuário (ação de admin).
-- A Edge Function usa service role e ignora RLS; a policy cobre acessos via cliente.
DROP POLICY IF EXISTS "Perfil inserção admin" ON public.app_user_profiles;
CREATE POLICY "Perfil inserção admin"
  ON public.app_user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- UPDATE: somente admin.
DROP POLICY IF EXISTS "Perfil atualização admin" ON public.app_user_profiles;
CREATE POLICY "Perfil atualização admin"
  ON public.app_user_profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- DELETE: somente admin. O ON DELETE CASCADE já remove o perfil junto com auth.users.
DROP POLICY IF EXISTS "Perfil exclusão admin" ON public.app_user_profiles;
CREATE POLICY "Perfil exclusão admin"
  ON public.app_user_profiles FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Recarrega o cache de schema do PostgREST
NOTIFY pgrst, 'reload schema';
