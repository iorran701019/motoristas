-- V10: alinha o CHECK de app_user_roles à fonte da verdade ('admin', 'operador')
--
-- Contexto: o app sempre usou 'admin'/'operador' (AuthContext, Edge Function
-- admin-users, migration 002). Mas o constraint app_user_roles_role_check no banco
-- remoto foi criado a partir de um estado anterior e NÃO aceitava 'operador'. O
-- CREATE TABLE IF NOT EXISTS da migration 002 não atualiza tabela já existente, então
-- a definição divergente persistiu. O erro 23514 só surgiu na 1ª criação de um
-- usuário não-admin (operador). Esta migration corrige o banco; o código fica igual.
--
-- Idempotente. Linhas existentes (todas 'admin') continuam válidas.

ALTER TABLE public.app_user_roles
  DROP CONSTRAINT IF EXISTS app_user_roles_role_check;

ALTER TABLE public.app_user_roles
  ADD CONSTRAINT app_user_roles_role_check
  CHECK (role IN ('admin', 'operador'));

-- Recarrega o cache de schema do PostgREST
NOTIFY pgrst, 'reload schema';
