-- V11: remove policies permissivas legadas do MVP em rotas_motoristas
--
-- Rode no SQL Editor do Supabase APÓS as migrations 001 a 010.
-- Limpeza de segurança pré-deploy: derruba as 4 policies "pública MVP"
-- (acesso liberado via anon key, USING/WITH CHECK true) que sobraram do
-- MVP inicial. O acesso correto já é coberto pelas policies de usuário
-- autenticado e a de exclusão restrita a admin — NÃO recriar nada aqui.
-- Idempotente (DROP ... IF EXISTS): pode ser reexecutada sem efeitos colaterais.

DROP POLICY IF EXISTS "Permitir leitura pública MVP" ON public.rotas_motoristas;
DROP POLICY IF EXISTS "Permitir inserção pública MVP" ON public.rotas_motoristas;
DROP POLICY IF EXISTS "Permitir atualização pública MVP" ON public.rotas_motoristas;
DROP POLICY IF EXISTS "Permitir exclusão pública MVP" ON public.rotas_motoristas;

-- Recarrega o cache de schema do PostgREST
NOTIFY pgrst, 'reload schema';
