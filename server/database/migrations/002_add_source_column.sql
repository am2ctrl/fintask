-- Migration: Add source column to transactions table
-- This allows tracking whether transactions were imported or manually created

-- Add source column with default 'manual' for existing transactions
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS source VARCHAR(30) DEFAULT 'manual' NOT NULL;

-- Add check constraint for valid source values
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_transaction_source'
    ) THEN
        ALTER TABLE transactions
        ADD CONSTRAINT chk_transaction_source
        CHECK (source IN ('manual', 'credit_card_import', 'bank_statement_import'));
    END IF;
END $$;

-- Create index for filtering by source
CREATE INDEX IF NOT EXISTS idx_transactions_source ON transactions(source);

-- Comment for documentation
COMMENT ON COLUMN transactions.source IS 'Origin of transaction: manual (created in app), credit_card_import (from credit card statement), bank_statement_import (from bank statement)';
