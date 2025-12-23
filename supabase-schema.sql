-- FinTask Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  color TEXT NOT NULL DEFAULT '#6366f1',
  icon TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credit cards table
CREATE TABLE IF NOT EXISTS credit_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  last_four_digits TEXT NOT NULL,
  card_type TEXT NOT NULL CHECK (card_type IN ('physical', 'virtual')),
  holder TEXT NOT NULL,
  purpose TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#1a1a2e',
  icon TEXT NOT NULL DEFAULT 'User',
  card_limit NUMERIC,
  closing_day INTEGER CHECK (closing_day >= 1 AND closing_day <= 31),
  due_day INTEGER CHECK (due_day >= 1 AND due_day <= 31),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'avulsa' CHECK (mode IN ('avulsa', 'recorrente', 'parcelada')),
  installment_number INTEGER,
  installments_total INTEGER,
  card_id UUID REFERENCES credit_cards(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default categories (run once, insert for null user_id as system defaults)
INSERT INTO categories (id, name, type, color, icon, user_id) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Salario', 'income', '#22c55e', 'Briefcase', NULL),
  ('00000000-0000-0000-0000-000000000002', 'Freelance', 'income', '#10b981', 'Laptop', NULL),
  ('00000000-0000-0000-0000-000000000003', 'Investimentos', 'income', '#14b8a6', 'TrendingUp', NULL),
  ('00000000-0000-0000-0000-000000000004', 'Outros Receitas', 'income', '#06b6d4', 'Plus', NULL),
  ('00000000-0000-0000-0000-000000000005', 'Alimentacao', 'expense', '#f97316', 'Utensils', NULL),
  ('00000000-0000-0000-0000-000000000006', 'Transporte', 'expense', '#eab308', 'Car', NULL),
  ('00000000-0000-0000-0000-000000000007', 'Moradia', 'expense', '#ef4444', 'Home', NULL),
  ('00000000-0000-0000-0000-000000000008', 'Saude', 'expense', '#ec4899', 'Heart', NULL),
  ('00000000-0000-0000-0000-000000000009', 'Educacao', 'expense', '#8b5cf6', 'GraduationCap', NULL),
  ('00000000-0000-0000-0000-000000000010', 'Lazer', 'expense', '#6366f1', 'Gamepad2', NULL),
  ('00000000-0000-0000-0000-000000000011', 'Contas', 'expense', '#0ea5e9', 'Receipt', NULL),
  ('00000000-0000-0000-0000-000000000012', 'Compras', 'expense', '#84cc16', 'ShoppingBag', NULL),
  ('00000000-0000-0000-0000-000000000013', 'Pet', 'expense', '#a855f7', 'Cat', NULL),
  ('00000000-0000-0000-0000-000000000014', 'Assinaturas', 'expense', '#f43f5e', 'Tv', NULL),
  ('00000000-0000-0000-0000-000000000015', 'Viagem', 'expense', '#0d9488', 'Plane', NULL),
  ('00000000-0000-0000-0000-000000000016', 'Roupas', 'expense', '#d946ef', 'Shirt', NULL),
  ('00000000-0000-0000-0000-000000000017', 'Beleza', 'expense', '#fb7185', 'Sparkles', NULL),
  ('00000000-0000-0000-0000-000000000018', 'Presente', 'expense', '#c084fc', 'Gift', NULL),
  ('00000000-0000-0000-0000-000000000019', 'Telefone', 'expense', '#38bdf8', 'Smartphone', NULL),
  ('00000000-0000-0000-0000-000000000020', 'Internet', 'expense', '#4ade80', 'Wifi', NULL),
  ('00000000-0000-0000-0000-000000000021', 'Streaming', 'expense', '#e11d48', 'Play', NULL),
  ('00000000-0000-0000-0000-000000000022', 'Banco', 'expense', '#475569', 'Building2', NULL),
  ('00000000-0000-0000-0000-000000000023', 'Outros Despesas', 'expense', '#94a3b8', 'MoreHorizontal', NULL),
  ('00000000-0000-0000-0000-000000000024', 'Bonus', 'income', '#fbbf24', 'Award', NULL)
ON CONFLICT (id) DO NOTHING;

-- Row Level Security (RLS) policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;

-- Policy for categories: users can see system defaults (user_id is null) and their own
CREATE POLICY "Users can view system and own categories" ON categories
  FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON categories
  FOR DELETE USING (auth.uid() = user_id);

-- Policy for transactions: users can only see/modify their own
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Policy for credit_cards: users can only see/modify their own
CREATE POLICY "Users can view own credit cards" ON credit_cards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credit cards" ON credit_cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own credit cards" ON credit_cards
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own credit cards" ON credit_cards
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_cards_user_id ON credit_cards(user_id);
