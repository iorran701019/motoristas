-- V8: audit log da EXCLUSÃO de veículos (reusa a função genérica da migration 007)
--
-- Rode no SQL Editor do Supabase APÓS as migrations 001 a 007.
-- Bloco 2a (continuação): só adiciona o trigger de DELETE em veiculos.
-- A função public.fn_audit_delete() NÃO é alterada — ela já deriva entity e
-- details (to_jsonb(OLD)) sozinha a partir da action passada via TG_ARGV[0].
-- Idempotente: pode ser reexecutada sem efeitos colaterais.

-- Trigger AFTER DELETE em public.veiculos
DROP TRIGGER IF EXISTS trg_audit_delete_veiculo ON public.veiculos;
CREATE TRIGGER trg_audit_delete_veiculo
  AFTER DELETE ON public.veiculos
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_audit_delete('veiculo.deleted');

-- Recarrega o cache de schema do PostgREST
NOTIFY pgrst, 'reload schema';
