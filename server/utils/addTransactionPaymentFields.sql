-- Migration: Adiciona campos de controle de pagamento e recorrência às transações
-- Data: 2026-01-08
-- Descrição: Adiciona is_paid, is_recurring e recurring_months à tabela transactions

-- Adicionar coluna is_paid (se a transação já foi paga)
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS is_paid BOOLEAN NOT NULL DEFAULT FALSE;

-- Adicionar coluna is_recurring (se é uma transação recorrente mensal)
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN NOT NULL DEFAULT FALSE;

-- Adicionar coluna recurring_months (quantos meses a recorrência deve durar)
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS recurring_months INTEGER;

-- Criar índice para melhorar performance de queries que filtram por is_paid
CREATE INDEX IF NOT EXISTS idx_transactions_is_paid ON transactions(is_paid);

-- Criar índice para melhorar performance de queries que filtram por is_recurring
CREATE INDEX IF NOT EXISTS idx_transactions_is_recurring ON transactions(is_recurring);

-- Criar índice composto para filtrar despesas não pagas com vencimento
CREATE INDEX IF NOT EXISTS idx_transactions_unpaid_due_date
ON transactions(is_paid, due_date)
WHERE type = 'expense' AND due_date IS NOT NULL;

-- Comentários nas colunas para documentação
COMMENT ON COLUMN transactions.is_paid IS 'Indica se a transação já foi paga (útil para transações retroativas)';
COMMENT ON COLUMN transactions.is_recurring IS 'Indica se a transação é recorrente mensalmente';
COMMENT ON COLUMN transactions.recurring_months IS 'Número de meses que a recorrência deve se repetir (null = indefinido)';
