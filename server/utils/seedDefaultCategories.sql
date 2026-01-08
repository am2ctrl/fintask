-- ========================================================
-- Script SQL para Popular Categorias Padrão no Supabase
-- ========================================================
--
-- IMPORTANTE: Execute este script no Supabase SQL Editor
-- ANTES de fazer deploy da aplicação.
--
-- Este script cria categorias padrão (user_id IS NULL) com
-- UUIDs fixos que correspondem ao mapeamento em
-- server/utils/categoryMapping.ts
--
-- ========================================================

-- Deletar categorias padrão existentes (se houver) para evitar duplicatas
DELETE FROM categories WHERE user_id IS NULL;

-- Inserir categorias de RECEITA (income)
INSERT INTO categories (id, name, type, color, icon, user_id) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Salário', 'income', '#22c55e', 'Banknote', NULL),
  ('22222222-2222-2222-2222-222222222222', 'Freelance', 'income', '#10b981', 'Briefcase', NULL),
  ('33333333-3333-3333-3333-333333333333', 'Investimentos', 'income', '#14b8a6', 'TrendingUp', NULL),
  ('44444444-4111-1111-1111-111111111111', 'Outros', 'income', '#06b6d4', 'CircleDollarSign', NULL);

-- Inserir categorias de DESPESA (expense)
INSERT INTO categories (id, name, type, color, icon, user_id) VALUES
  ('55555555-5555-5555-5555-555555555555', 'Alimentação', 'expense', '#f97316', 'UtensilsCrossed', NULL),
  ('66666666-6666-6666-6666-666666666666', 'Transporte', 'expense', '#eab308', 'Car', NULL),
  ('77777777-7777-7777-7777-777777777777', 'Moradia', 'expense', '#ef4444', 'Home', NULL),
  ('88888888-8888-8888-8888-888888888888', 'Saúde', 'expense', '#ec4899', 'Heart', NULL),
  ('99999999-9999-9999-9999-999999999999', 'Educação', 'expense', '#8b5cf6', 'GraduationCap', NULL),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Lazer', 'expense', '#6366f1', 'Gamepad2', NULL),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Contas', 'expense', '#0ea5e9', 'Receipt', NULL),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Compras', 'expense', '#84cc16', 'ShoppingBag', NULL);

-- Verificar inserção
SELECT id, name, type, color, user_id FROM categories WHERE user_id IS NULL ORDER BY name;

-- ========================================================
-- Resultado Esperado:
-- 12 categorias padrão com UUIDs fixos e user_id IS NULL
-- ========================================================
