-- V4: renomeia status Executada->Concluída + cadastros de motoristas e veículos
--
-- Rode no SQL Editor do Supabase APÓS as migrations 001, 002 e 003.

-- 1) Status: "Executada" passa a se chamar "Concluída"
ALTER TABLE rotas_motoristas
  DROP CONSTRAINT IF EXISTS rotas_motoristas_status_check;

UPDATE rotas_motoristas
  SET status = 'Concluída'
  WHERE status = 'Executada';

ALTER TABLE rotas_motoristas
  ADD CONSTRAINT rotas_motoristas_status_check
  CHECK (status IN ('Agendada', 'Concluída', 'Cancelada', 'Adiada'));

-- 2) Cadastro de motoristas
CREATE TABLE IF NOT EXISTS motoristas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_completo TEXT NOT NULL,
  matricula TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_motoristas_nome ON motoristas (nome_completo);

-- 3) Cadastro de veículos
CREATE TABLE IF NOT EXISTS veiculos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placa TEXT NOT NULL UNIQUE,
  modelo TEXT NOT NULL,
  cor TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_veiculos_placa ON veiculos (placa);

-- 4) RLS — todos os usuários autenticados podem gerenciar (acesso total)
ALTER TABLE motoristas ENABLE ROW LEVEL SECURITY;
ALTER TABLE veiculos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Motoristas acesso autenticado" ON motoristas;
CREATE POLICY "Motoristas acesso autenticado"
  ON motoristas FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Veiculos acesso autenticado" ON veiculos;
CREATE POLICY "Veiculos acesso autenticado"
  ON veiculos FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE motoristas IS 'Cadastro de motoristas (nome completo + matrícula)';
COMMENT ON TABLE veiculos IS 'Cadastro de veículos (placa, modelo, cor)';

-- 5) Recarrega o cache de schema do PostgREST
NOTIFY pgrst, 'reload schema';
