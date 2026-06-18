-- V12: matrícula passa de exatamente 6 dígitos para 4 a 6 dígitos
--
-- Rode no SQL Editor do Supabase APÓS as migrations 001 a 011.
--
-- Esta migration é idempotente e resiliente a schema drift: em vez de assumir
-- o nome das CHECK constraints (que pode divergir do versionado), ela varre
-- pg_constraint procurando TODAS as check constraints definidas sobre qualquer
-- coluna chamada "matricula", dropa cada uma pelo nome real e recria a regra
-- com o novo padrão POSIX '^[0-9]{4,6}$'.

DO $$
DECLARE
  r RECORD;
BEGIN
  -- 1) Dropa toda CHECK constraint existente sobre coluna "matricula"
  FOR r IN
    SELECT
      n.nspname  AS schema_name,
      c.relname  AS table_name,
      con.conname AS constraint_name
    FROM pg_constraint con
    JOIN pg_class c       ON c.oid = con.conrelid
    JOIN pg_namespace n   ON n.oid = c.relnamespace
    WHERE con.contype = 'c'
      AND EXISTS (
        SELECT 1
        FROM unnest(con.conkey) AS colnum
        JOIN pg_attribute a
          ON a.attrelid = con.conrelid
         AND a.attnum = colnum
        WHERE a.attname = 'matricula'
      )
  LOOP
    EXECUTE format(
      'ALTER TABLE %I.%I DROP CONSTRAINT IF EXISTS %I',
      r.schema_name, r.table_name, r.constraint_name
    );
    RAISE NOTICE 'Dropped constraint % on %.%', r.constraint_name, r.schema_name, r.table_name;
  END LOOP;

  -- 2) Recria a CHECK (4 a 6 dígitos) em toda tabela que tenha coluna "matricula"
  FOR r IN
    SELECT
      n.nspname AS schema_name,
      c.relname AS table_name
    FROM pg_attribute a
    JOIN pg_class c     ON c.oid = a.attrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE a.attname = 'matricula'
      AND a.attnum > 0
      AND NOT a.attisdropped
      AND c.relkind = 'r'                 -- apenas tabelas comuns
      AND n.nspname NOT IN ('pg_catalog', 'information_schema')
  LOOP
    EXECUTE format(
      'ALTER TABLE %I.%I ADD CONSTRAINT %I CHECK (matricula ~ ''^[0-9]{4,6}$'')',
      r.schema_name,
      r.table_name,
      r.table_name || '_matricula_4_6_digits_check'
    );
    RAISE NOTICE 'Added 4-6 digit check on %.%', r.schema_name, r.table_name;
  END LOOP;
END $$;
