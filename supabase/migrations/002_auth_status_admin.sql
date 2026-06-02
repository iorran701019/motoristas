-- V2: status logístico + autenticação fechada + base de permissões admin

-- 1) Status na tabela de rotas
ALTER TABLE rotas_motoristas
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'Agendada';

ALTER TABLE rotas_motoristas
  DROP CONSTRAINT IF EXISTS rotas_motoristas_status_check;

ALTER TABLE rotas_motoristas
  ADD CONSTRAINT rotas_motoristas_status_check
  CHECK (status IN ('Agendada', 'Executada', 'Cancelada', 'Adiada'));

-- 2) Fechar acesso público do MVP antigo
DROP POLICY IF EXISTS "Permitir leitura pública MVP" ON rotas_motoristas;
DROP POLICY IF EXISTS "Permitir inserção pública MVP" ON rotas_motoristas;
DROP POLICY IF EXISTS "Permitir atualização pública MVP" ON rotas_motoristas;
DROP POLICY IF EXISTS "Permitir exclusão pública MVP" ON rotas_motoristas;

-- 3) Papel de usuário no sistema (admin / operador)
CREATE TABLE IF NOT EXISTS app_user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'operador')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE app_user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuário lê o próprio papel" ON app_user_roles;
CREATE POLICY "Usuário lê o próprio papel"
  ON app_user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin gerencia papéis" ON app_user_roles;
CREATE POLICY "Admin gerencia papéis"
  ON app_user_roles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_user_roles aur
      WHERE aur.user_id = auth.uid() AND aur.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_user_roles aur
      WHERE aur.user_id = auth.uid() AND aur.role = 'admin'
    )
  );

-- 4) Rotas acessíveis somente para usuários autenticados
ALTER TABLE rotas_motoristas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Rotas leitura autenticada" ON rotas_motoristas;
CREATE POLICY "Rotas leitura autenticada"
  ON rotas_motoristas FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Rotas inserção autenticada" ON rotas_motoristas;
CREATE POLICY "Rotas inserção autenticada"
  ON rotas_motoristas FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Rotas atualização autenticada" ON rotas_motoristas;
CREATE POLICY "Rotas atualização autenticada"
  ON rotas_motoristas FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Rotas exclusão admin" ON rotas_motoristas;
CREATE POLICY "Rotas exclusão admin"
  ON rotas_motoristas FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_user_roles aur
      WHERE aur.user_id = auth.uid() AND aur.role = 'admin'
    )
  );

-- 5) Primeiro admin (ajuste para o e-mail real do responsável)
-- Execute apenas uma vez após criar o usuário de login no Supabase Auth:
-- INSERT INTO app_user_roles (user_id, role)
-- SELECT id, 'admin' FROM auth.users WHERE email = 'admin@prefeitura.gov.br'
-- ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;
