-- ========================================================
-- Migration: Adicionar coluna parent_id na tabela categories
-- ========================================================
--
-- IMPORTANTE: Execute este script ANTES de rodar o seedDefaultCategories.sql
-- Este script adiciona suporte a categorias hierárquicas (pai/subcategorias)
--
-- ========================================================

-- Verificar se a coluna já existe antes de adicionar
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'parent_id'
  ) THEN
    -- Adicionar coluna parent_id
    ALTER TABLE categories ADD COLUMN parent_id UUID REFERENCES categories(id) ON DELETE SET NULL;

    -- Criar índice para melhorar performance de queries hierárquicas
    CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);

    RAISE NOTICE 'Coluna parent_id adicionada com sucesso!';
  ELSE
    RAISE NOTICE 'Coluna parent_id já existe.';
  END IF;
END $$;

-- Verificar resultado
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'categories'
ORDER BY ordinal_position;
