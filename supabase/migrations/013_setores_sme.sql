-- V13: suporte a "Setor da SME"
--
-- Rode no SQL Editor do Supabase APÓS as migrations 001 a 012.
-- Idempotente onde faz sentido (CREATE TABLE IF NOT EXISTS, DROP POLICY IF EXISTS,
-- ADD COLUMN IF NOT EXISTS).
--
-- Reutiliza a função public.is_admin() (SECURITY DEFINER, migration 003) para o
-- gating de role — mesmo mecanismo já usado em app_user_profiles, audit_logs e
-- na exclusão de rotas. NÃO introduz checagem de role nova.

-- 1) Tabela de setores
CREATE TABLE IF NOT EXISTS public.setores_sme (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome       TEXT NOT NULL UNIQUE,
  cor        TEXT NOT NULL CHECK (cor ~ '^#[0-9A-Fa-f]{6}$'), -- cor da fonte no calendário
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) RLS
ALTER TABLE public.setores_sme ENABLE ROW LEVEL SECURITY;

-- SELECT: qualquer usuário autenticado (admin e operador) pode ler.
DROP POLICY IF EXISTS "Setores leitura autenticada" ON public.setores_sme;
CREATE POLICY "Setores leitura autenticada"
  ON public.setores_sme FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: somente admin.
DROP POLICY IF EXISTS "Setores inserção admin" ON public.setores_sme;
CREATE POLICY "Setores inserção admin"
  ON public.setores_sme FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- UPDATE: somente admin.
DROP POLICY IF EXISTS "Setores atualização admin" ON public.setores_sme;
CREATE POLICY "Setores atualização admin"
  ON public.setores_sme FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- DELETE: somente admin.
DROP POLICY IF EXISTS "Setores exclusão admin" ON public.setores_sme;
CREATE POLICY "Setores exclusão admin"
  ON public.setores_sme FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 3) Limpa as rotas de teste ANTES de adicionar a coluna obrigatória.
--    TRUNCATE (e não DELETE) para NÃO disparar o trigger de auditoria
--    trg_audit_delete_rota (migration 007), que geraria N entradas
--    "rota.deleted" sem autor em audit_logs. São todas de teste (confirmado).
--    Nenhuma tabela tem FK para rotas_motoristas, então não há ordem de FK a respeitar.
TRUNCATE TABLE public.rotas_motoristas;

-- 4) Coluna obrigatória de setor em rotas.
--    Tabela vazia após o TRUNCATE, então NOT NULL nasce direto, sem placeholder.
--    ON DELETE RESTRICT: não deixa apagar setor que tem rota vinculada.
ALTER TABLE public.rotas_motoristas
  ADD COLUMN IF NOT EXISTS setor_id UUID NOT NULL
  REFERENCES public.setores_sme(id) ON DELETE RESTRICT;

-- Índice para filtros/joins por setor
CREATE INDEX IF NOT EXISTS idx_rotas_motoristas_setor_id
  ON public.rotas_motoristas (setor_id);

COMMENT ON TABLE public.setores_sme IS 'Setores da Secretaria Municipal de Educação; cor define a fonte do setor no calendário';

-- Recarrega o cache de schema do PostgREST
NOTIFY pgrst, 'reload schema';
