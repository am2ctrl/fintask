-- =============================================================
-- Adicionar Coluna due_date à Tabela transactions
-- =============================================================
--
-- Este script adiciona a coluna 'due_date' (data de vencimento)
-- à tabela transactions para rastrear vencimentos de despesas
--
-- =============================================================

-- PASSO 1: Adicionar coluna due_date (nullable, apenas para despesas)
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS due_date TEXT;

-- PASSO 2: Comentário na coluna para documentação
COMMENT ON COLUMN transactions.due_date IS 'Data de vencimento da despesa (formato ISO 8601). Aplicável apenas para type=expense';

-- PASSO 3: Criar índice para melhorar performance de consultas por data de vencimento
CREATE INDEX IF NOT EXISTS idx_transactions_due_date
ON transactions(due_date)
WHERE due_date IS NOT NULL;

-- PASSO 4: Criar índice composto para consultas de próximas despesas por usuário
CREATE INDEX IF NOT EXISTS idx_transactions_user_due_date
ON transactions(user_id, due_date)
WHERE due_date IS NOT NULL AND type = 'expense';

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
AND indexname LIKE '%due_date%';
