-- V7: audit log das EXCLUSÕES via trigger SQL (à prova de adulteração)
--
-- Rode no SQL Editor do Supabase APÓS as migrations 001 a 006.
-- Bloco 2a de 3: só DELETE, capturado no banco. O autor real vem de auth.uid(),
-- não do cliente — o frontend não consegue forjar nem suprimir esse registro.
-- Idempotente: pode ser reexecutada sem efeitos colaterais.

-- 1) Função genérica de auditoria de exclusão.
--    SECURITY DEFINER: roda com privilégios do dono, então a INSERT em audit_logs
--    passa pelo RLS (a policy de INSERT exige actor_id = auth.uid(), que esta
--    função preenche com o autor REAL da sessão).
--    A action é passada na criação do trigger via TG_ARGV[0].
CREATE OR REPLACE FUNCTION public.fn_audit_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (actor_id, actor_email, action, entity, entity_id, details)
  VALUES (
    auth.uid(),
    (SELECT email FROM auth.users WHERE id = auth.uid()),
    TG_ARGV[0],
    split_part(TG_ARGV[0], '.', 1),  -- 'motorista.deleted' -> 'motorista'
    OLD.id::text,
    to_jsonb(OLD)
  );
  RETURN OLD;
END;
$$;

REVOKE ALL ON FUNCTION public.fn_audit_delete() FROM public;

-- 2) Triggers AFTER DELETE — disparam após a exclusão efetiva da linha.
DROP TRIGGER IF EXISTS trg_audit_delete_motorista ON public.motoristas;
CREATE TRIGGER trg_audit_delete_motorista
  AFTER DELETE ON public.motoristas
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_audit_delete('motorista.deleted');

DROP TRIGGER IF EXISTS trg_audit_delete_rota ON public.rotas_motoristas;
CREATE TRIGGER trg_audit_delete_rota
  AFTER DELETE ON public.rotas_motoristas
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_audit_delete('rota.deleted');

-- Recarrega o cache de schema do PostgREST
NOTIFY pgrst, 'reload schema';
