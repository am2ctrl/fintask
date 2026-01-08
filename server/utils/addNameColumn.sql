-- =============================================================
-- Adicionar Coluna 'name' e Tornar 'description' Opcional
-- =============================================================
--
-- Este script separa o campo description em dois:
-- - name: nome curto da transação (obrigatório)
-- - description: detalhes adicionais (opcional)
--
-- =============================================================

-- PASSO 1: Adicionar coluna 'name' com default vazio
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT '';

-- PASSO 2: Migrar dados existentes - copiar 'description' para 'name'
UPDATE transactions
SET name = description
WHERE name = '';

-- PASSO 3: Tornar 'description' opcional (nullable)
ALTER TABLE transactions
ALTER COLUMN description DROP NOT NULL;

-- PASSO 4: Adicionar comentários para documentação
COMMENT ON COLUMN transactions.name IS 'Nome curto da transação para identificação';
COMMENT ON COLUMN transactions.description IS 'Descrição opcional com detalhes adicionais';

-- PASSO 5: Criar índice para melhorar performance de buscas por nome
CREATE INDEX IF NOT EXISTS idx_transactions_name ON transactions(name);

-- =============================================================
-- VERIFICAÇÃO:
-- =============================================================

-- Ver estrutura da tabela atualizada
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'transactions'
ORDER BY ordinal_position;

-- Ver índices criados
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'transactions'
AND indexname = 'idx_transactions_name';
