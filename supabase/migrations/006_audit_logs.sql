-- V6: fundação do audit log (tabela imutável + RLS)
--
-- Rode no SQL Editor do Supabase APÓS as migrations 001 a 005.
-- Bloco 1 de 3: apenas a fundação. A instrumentação das ações vem depois.
-- Idempotente: pode ser reexecutada sem efeitos colaterais.

-- 0) Extensão para gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Tabela de registro de auditoria
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- quem fez; nullable p/ não perder log se o usuário for removido
  actor_email TEXT,        -- e-mail do operador no momento da ação, para leitura humana
  action      TEXT NOT NULL, -- ex: 'motorista.created', 'rota.deleted', 'auth.login'
  entity      TEXT,        -- ex: 'motorista', 'rota', 'auth'
  entity_id   TEXT,        -- id do registro afetado, como texto p/ aceitar uuid ou outros
  details     JSONB        -- payload livre: nome do motorista, destino da rota, etc.
);

-- 2) Índices para o relatório de auditoria
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON public.audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_actor_id_idx ON public.audit_logs (actor_id);
CREATE INDEX IF NOT EXISTS audit_logs_action_idx ON public.audit_logs (action);

-- 3) RLS: log imutável, legível só por admin
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- INSERT: qualquer usuário autenticado pode registrar, mas só em nome de si mesmo.
-- A checagem actor_id = auth.uid() impede forjar autoria de outro usuário.
DROP POLICY IF EXISTS "Audit inserção autenticada" ON public.audit_logs;
CREATE POLICY "Audit inserção autenticada"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (actor_id = auth.uid());

-- SELECT: somente admin (reutiliza a função SECURITY DEFINER da migration 003).
DROP POLICY IF EXISTS "Audit leitura admin" ON public.audit_logs;
CREATE POLICY "Audit leitura admin"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- UPDATE e DELETE: NINGUÉM. Sem policy = negado pelo RLS. O log é imutável.

-- Recarrega o cache de schema do PostgREST
NOTIFY pgrst, 'reload schema';
