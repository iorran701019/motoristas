-- V3: corrige recursão infinita de RLS em app_user_roles
--
-- Problema: as policies de admin faziam `SELECT FROM app_user_roles` dentro da
-- própria policy da tabela app_user_roles. Avaliar a policy exigia ler a tabela,
-- que exigia avaliar a policy de novo → "infinite recursion detected in policy".
--
-- Solução: encapsular a checagem em uma função SECURITY DEFINER. Por rodar com os
-- privilégios do dono da tabela, o SELECT interno ignora o RLS e quebra o ciclo.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.app_user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM public;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Recria a policy de gestão de papéis sem auto-referência recursiva.
-- A policy "Usuário lê o próprio papel" continua valendo (policies permissivas
-- são combinadas com OR), então o AuthContext ainda consegue ler o próprio role.
DROP POLICY IF EXISTS "Admin gerencia papéis" ON app_user_roles;
CREATE POLICY "Admin gerencia papéis"
  ON app_user_roles FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Mesma função na exclusão de rotas (consistência e clareza).
DROP POLICY IF EXISTS "Rotas exclusão admin" ON rotas_motoristas;
CREATE POLICY "Rotas exclusão admin"
  ON rotas_motoristas FOR DELETE
  TO authenticated
  USING (public.is_admin());
