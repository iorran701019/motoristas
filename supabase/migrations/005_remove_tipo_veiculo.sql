-- V5: remove o conceito de "tipo de veículo"
--
-- Rode no SQL Editor do Supabase APÓS as migrations 001 a 004.
-- Idempotente: cobre tanto instalações novas quanto bancos que já tinham as colunas.

-- Remove a coluna NOT NULL de tipo_veiculo das rotas (bloqueava inserts sem o campo)
ALTER TABLE rotas_motoristas DROP COLUMN IF EXISTS tipo_veiculo;

-- Remove tipo do cadastro de veículos (caso a 004 anterior já tivesse criado)
ALTER TABLE veiculos DROP COLUMN IF EXISTS tipo;

-- Recarrega o cache de schema do PostgREST
NOTIFY pgrst, 'reload schema';
