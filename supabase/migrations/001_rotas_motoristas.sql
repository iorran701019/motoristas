-- Tabela principal de rotas dos motoristas da SME
-- Execute no SQL Editor do Supabase ou via CLI

CREATE TABLE IF NOT EXISTS rotas_motoristas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  motorista TEXT NOT NULL,
  data DATE NOT NULL,
  placa_veiculo TEXT NOT NULL,
  tipo_veiculo TEXT NOT NULL,
  rota_descricao TEXT NOT NULL,
  destino_principal TEXT NOT NULL,
  horario_saida TIME NOT NULL,
  horario_retorno TIME NOT NULL,
  qtd_passageiros INTEGER NOT NULL DEFAULT 0 CHECK (qtd_passageiros >= 0),
  responsavel_solicitacao TEXT NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para consultas do dashboard
CREATE INDEX IF NOT EXISTS idx_rotas_motoristas_data ON rotas_motoristas (data);
CREATE INDEX IF NOT EXISTS idx_rotas_motoristas_motorista ON rotas_motoristas (motorista);
CREATE INDEX IF NOT EXISTS idx_rotas_motoristas_created_at ON rotas_motoristas (created_at DESC);

-- RLS habilitado para preparar autenticação futura
ALTER TABLE rotas_motoristas ENABLE ROW LEVEL SECURITY;

-- Política temporária: acesso público via anon key (MVP interno)
-- ATENÇÃO: substituir por políticas baseadas em auth.uid() quando autenticação for implementada
CREATE POLICY "Permitir leitura pública MVP"
  ON rotas_motoristas FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserção pública MVP"
  ON rotas_motoristas FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir atualização pública MVP"
  ON rotas_motoristas FOR UPDATE
  USING (true);

CREATE POLICY "Permitir exclusão pública MVP"
  ON rotas_motoristas FOR DELETE
  USING (true);

COMMENT ON TABLE rotas_motoristas IS 'Registro de rotas realizadas por motoristas da Secretaria Municipal de Educação';
