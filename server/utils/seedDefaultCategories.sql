-- ========================================================
-- Script SQL para Popular Categorias Padrão no Supabase
-- Sistema Hierárquico: Categorias Pai -> Subcategorias
-- ========================================================
--
-- IMPORTANTE: Execute este script no Supabase SQL Editor
-- ANTES de fazer deploy da aplicação.
--
-- Este script cria categorias padrão (user_id IS NULL) com
-- UUIDs fixos que correspondem ao mapeamento em
-- server/utils/categoryMapping.ts
--
-- ESTRUTURA:
-- - Categorias PAI (parent_id IS NULL): agrupadores principais
-- - SUBCATEGORIAS (parent_id = UUID do pai): categorias detalhadas
--
-- ========================================================

-- Deletar categorias padrão existentes (se houver) para evitar duplicatas
DELETE FROM categories WHERE user_id IS NULL;

-- ========================================================
-- CATEGORIAS DE RECEITA (income)
-- ========================================================

-- PAI: Receitas (agrupador)
INSERT INTO categories (id, name, type, color, icon, user_id, parent_id) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Receitas', 'income', '#22c55e', 'Wallet', NULL, NULL);

-- Subcategorias de Receitas
INSERT INTO categories (id, name, type, color, icon, user_id, parent_id) VALUES
  ('10000000-0000-0000-0000-000000000101', 'Salário', 'income', '#22c55e', 'Banknote', NULL, '10000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000102', 'Freelance', 'income', '#10b981', 'Briefcase', NULL, '10000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000103', 'Investimentos', 'income', '#14b8a6', 'TrendingUp', NULL, '10000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000104', 'Bonificações', 'income', '#06b6d4', 'Award', NULL, '10000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000105', 'Reembolsos', 'income', '#0ea5e9', 'RotateCcw', NULL, '10000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000106', 'Outras Receitas', 'income', '#6366f1', 'CircleDollarSign', NULL, '10000000-0000-0000-0000-000000000001');

-- ========================================================
-- 1. MORADIA (Gastos Fixos e Variáveis de Casa)
-- ========================================================

-- PAI: Moradia
INSERT INTO categories (id, name, type, color, icon, user_id, parent_id) VALUES
  ('20000000-0000-0000-0000-000000000001', 'Moradia', 'expense', '#ef4444', 'Home', NULL, NULL);

-- Subcategorias de Moradia
INSERT INTO categories (id, name, type, color, icon, user_id, parent_id) VALUES
  ('20000000-0000-0000-0000-000000000101', 'Habitação', 'expense', '#ef4444', 'Building', NULL, '20000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000102', 'Contas de Consumo', 'expense', '#f97316', 'Zap', NULL, '20000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000103', 'Manutenção', 'expense', '#eab308', 'Wrench', NULL, '20000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000104', 'Smart Home', 'expense', '#84cc16', 'Cpu', NULL, '20000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000105', 'Casa e Utensílios', 'expense', '#22c55e', 'Sofa', NULL, '20000000-0000-0000-0000-000000000001');

-- ========================================================
-- 2. TRANSPORTE (Mobilidade)
-- ========================================================

-- PAI: Transporte
INSERT INTO categories (id, name, type, color, icon, user_id, parent_id) VALUES
  ('20000000-0000-0000-0000-000000000002', 'Transporte', 'expense', '#eab308', 'Car', NULL, NULL);

-- Subcategorias de Transporte
INSERT INTO categories (id, name, type, color, icon, user_id, parent_id) VALUES
  ('20000000-0000-0000-0000-000000000201', 'Combustível', 'expense', '#eab308', 'Fuel', NULL, '20000000-0000-0000-0000-000000000002'),
  ('20000000-0000-0000-0000-000000000202', 'Manutenção Veicular', 'expense', '#f97316', 'Settings', NULL, '20000000-0000-0000-0000-000000000002'),
  ('20000000-0000-0000-0000-000000000203', 'Documentação', 'expense', '#ef4444', 'FileText', NULL, '20000000-0000-0000-0000-000000000002'),
  ('20000000-0000-0000-0000-000000000204', 'Urbano', 'expense', '#22c55e', 'Bus', NULL, '20000000-0000-0000-0000-000000000002'),
  ('20000000-0000-0000-0000-000000000205', 'Acessórios Veículo', 'expense', '#84cc16', 'Gauge', NULL, '20000000-0000-0000-0000-000000000002');

-- ========================================================
-- 3. ALIMENTAÇÃO
-- ========================================================

-- PAI: Alimentação
INSERT INTO categories (id, name, type, color, icon, user_id, parent_id) VALUES
  ('20000000-0000-0000-0000-000000000003', 'Alimentação', 'expense', '#f97316', 'UtensilsCrossed', NULL, NULL);

-- Subcategorias de Alimentação
INSERT INTO categories (id, name, type, color, icon, user_id, parent_id) VALUES
  ('20000000-0000-0000-0000-000000000301', 'Supermercado', 'expense', '#f97316', 'ShoppingCart', NULL, '20000000-0000-0000-0000-000000000003'),
  ('20000000-0000-0000-0000-000000000302', 'Alimentação Fora', 'expense', '#ef4444', 'Utensils', NULL, '20000000-0000-0000-0000-000000000003'),
  ('20000000-0000-0000-0000-000000000303', 'Padaria e Feira', 'expense', '#eab308', 'Croissant', NULL, '20000000-0000-0000-0000-000000000003'),
  ('20000000-0000-0000-0000-000000000304', 'Suplementação', 'expense', '#22c55e', 'Pill', NULL, '20000000-0000-0000-0000-000000000003');

-- ========================================================
-- 4. SAÚDE
-- ========================================================

-- PAI: Saúde
INSERT INTO categories (id, name, type, color, icon, user_id, parent_id) VALUES
  ('20000000-0000-0000-0000-000000000004', 'Saúde', 'expense', '#ec4899', 'Heart', NULL, NULL);

-- Subcategorias de Saúde
INSERT INTO categories (id, name, type, color, icon, user_id, parent_id) VALUES
  ('20000000-0000-0000-0000-000000000401', 'Plano de Saúde', 'expense', '#ec4899', 'ShieldCheck', NULL, '20000000-0000-0000-0000-000000000004'),
  ('20000000-0000-0000-0000-000000000402', 'Farmácia', 'expense', '#f472b6', 'Cross', NULL, '20000000-0000-0000-0000-000000000004'),
  ('20000000-0000-0000-0000-000000000403', 'Consultas e Exames', 'expense', '#db2777', 'Stethoscope', NULL, '20000000-0000-0000-0000-000000000004'),
  ('20000000-0000-0000-0000-000000000404', 'Procedimentos', 'expense', '#be185d', 'Syringe', NULL, '20000000-0000-0000-0000-000000000004'),
  ('20000000-0000-0000-0000-000000000405', 'Cuidados e Bem-estar', 'expense', '#a855f7', 'Sparkles', NULL, '20000000-0000-0000-0000-000000000004');

-- ========================================================
-- 5. EDUCAÇÃO
-- ========================================================

-- PAI: Educação
INSERT INTO categories (id, name, type, color, icon, user_id, parent_id) VALUES
  ('20000000-0000-0000-0000-000000000005', 'Educação', 'expense', '#8b5cf6', 'GraduationCap', NULL, NULL);

-- Subcategorias de Educação
INSERT INTO categories (id, name, type, color, icon, user_id, parent_id) VALUES
  ('20000000-0000-0000-0000-000000000501', 'Mensalidade Escolar', 'expense', '#8b5cf6', 'School', NULL, '20000000-0000-0000-0000-000000000005'),
  ('20000000-0000-0000-0000-000000000502', 'Cursos', 'expense', '#7c3aed', 'BookOpen', NULL, '20000000-0000-0000-0000-000000000005'),
  ('20000000-0000-0000-0000-000000000503', 'Livros e Material', 'expense', '#6d28d9', 'Book', NULL, '20000000-0000-0000-0000-000000000005');

-- ========================================================
-- 6. LAZER E ESTILO DE VIDA
-- ========================================================

-- PAI: Lazer
INSERT INTO categories (id, name, type, color, icon, user_id, parent_id) VALUES
  ('20000000-0000-0000-0000-000000000006', 'Lazer', 'expense', '#6366f1', 'PartyPopper', NULL, NULL);

-- Subcategorias de Lazer
INSERT INTO categories (id, name, type, color, icon, user_id, parent_id) VALUES
  ('20000000-0000-0000-0000-000000000601', 'Viagens e Férias', 'expense', '#6366f1', 'Plane', NULL, '20000000-0000-0000-0000-000000000006'),
  ('20000000-0000-0000-0000-000000000602', 'Entretenimento', 'expense', '#818cf8', 'Clapperboard', NULL, '20000000-0000-0000-0000-000000000006'),
  ('20000000-0000-0000-0000-000000000603', 'Hobbies e Cultura', 'expense', '#a5b4fc', 'Palette', NULL, '20000000-0000-0000-0000-000000000006'),
  ('20000000-0000-0000-0000-000000000604', 'Vida Noturna', 'expense', '#4f46e5', 'Wine', NULL, '20000000-0000-0000-0000-000000000006');

-- ========================================================
-- 7. STREAMING E SERVIÇOS DIGITAIS
-- ========================================================

-- PAI: Streaming/Serviços
INSERT INTO categories (id, name, type, color, icon, user_id, parent_id) VALUES
  ('20000000-0000-0000-0000-000000000007', 'Streaming e Serviços', 'expense', '#0ea5e9', 'Tv', NULL, NULL);

-- Subcategorias de Streaming
INSERT INTO categories (id, name, type, color, icon, user_id, parent_id) VALUES
  ('20000000-0000-0000-0000-000000000701', 'Streaming TV', 'expense', '#0ea5e9', 'Play', NULL, '20000000-0000-0000-0000-000000000007'),
  ('20000000-0000-0000-0000-000000000702', 'Música', 'expense', '#06b6d4', 'Music', NULL, '20000000-0000-0000-0000-000000000007'),
  ('20000000-0000-0000-0000-000000000703', 'Cloud e Storage', 'expense', '#14b8a6', 'Cloud', NULL, '20000000-0000-0000-0000-000000000007'),
  ('20000000-0000-0000-0000-000000000704', 'Inteligência Artificial', 'expense', '#8b5cf6', 'Bot', NULL, '20000000-0000-0000-0000-000000000007'),
  ('20000000-0000-0000-0000-000000000705', 'Games', 'expense', '#22c55e', 'Gamepad2', NULL, '20000000-0000-0000-0000-000000000007');

-- ========================================================
-- 8. TRIBUTOS
-- ========================================================

-- PAI: Tributos
INSERT INTO categories (id, name, type, color, icon, user_id, parent_id) VALUES
  ('20000000-0000-0000-0000-000000000008', 'Tributos', 'expense', '#64748b', 'Landmark', NULL, NULL);

-- Subcategorias de Tributos
INSERT INTO categories (id, name, type, color, icon, user_id, parent_id) VALUES
  ('20000000-0000-0000-0000-000000000801', 'IPVA', 'expense', '#64748b', 'Car', NULL, '20000000-0000-0000-0000-000000000008'),
  ('20000000-0000-0000-0000-000000000802', 'IPTU', 'expense', '#475569', 'Home', NULL, '20000000-0000-0000-0000-000000000008'),
  ('20000000-0000-0000-0000-000000000803', 'IRPF', 'expense', '#334155', 'FileSpreadsheet', NULL, '20000000-0000-0000-0000-000000000008'),
  ('20000000-0000-0000-0000-000000000804', 'Ganho de Capital', 'expense', '#1e293b', 'TrendingUp', NULL, '20000000-0000-0000-0000-000000000008'),
  ('20000000-0000-0000-0000-000000000805', 'Taxas Profissionais', 'expense', '#94a3b8', 'BadgeCheck', NULL, '20000000-0000-0000-0000-000000000008'),
  ('20000000-0000-0000-0000-000000000806', 'Multas', 'expense', '#ef4444', 'AlertTriangle', NULL, '20000000-0000-0000-0000-000000000008'),
  ('20000000-0000-0000-0000-000000000807', 'Seguro Incêndio', 'expense', '#f97316', 'Flame', NULL, '20000000-0000-0000-0000-000000000008'),
  ('20000000-0000-0000-0000-000000000808', 'Outros Tributos', 'expense', '#cbd5e1', 'Receipt', NULL, '20000000-0000-0000-0000-000000000008');

-- ========================================================
-- 9. COMPRAS (Bens e Consumo)
-- ========================================================

-- PAI: Compras
INSERT INTO categories (id, name, type, color, icon, user_id, parent_id) VALUES
  ('20000000-0000-0000-0000-000000000009', 'Compras', 'expense', '#84cc16', 'ShoppingBag', NULL, NULL);

-- Subcategorias de Compras
INSERT INTO categories (id, name, type, color, icon, user_id, parent_id) VALUES
  ('20000000-0000-0000-0000-000000000901', 'Vestuário', 'expense', '#84cc16', 'Shirt', NULL, '20000000-0000-0000-0000-000000000009'),
  ('20000000-0000-0000-0000-000000000902', 'Presentes', 'expense', '#22c55e', 'Gift', NULL, '20000000-0000-0000-0000-000000000009'),
  ('20000000-0000-0000-0000-000000000903', 'Eletrônicos', 'expense', '#0ea5e9', 'Smartphone', NULL, '20000000-0000-0000-0000-000000000009'),
  ('20000000-0000-0000-0000-000000000904', 'Cuidados Pessoais', 'expense', '#ec4899', 'Sparkles', NULL, '20000000-0000-0000-0000-000000000009');

-- ========================================================
-- 10. OUTROS (Fallback)
-- ========================================================

-- PAI: Outros
INSERT INTO categories (id, name, type, color, icon, user_id, parent_id) VALUES
  ('20000000-0000-0000-0000-000000000010', 'Outros', 'expense', '#9ca3af', 'CircleDot', NULL, NULL);

-- Subcategorias de Outros
INSERT INTO categories (id, name, type, color, icon, user_id, parent_id) VALUES
  ('20000000-0000-0000-0000-000000001001', 'Taxas Bancárias', 'expense', '#6b7280', 'Building2', NULL, '20000000-0000-0000-0000-000000000010'),
  ('20000000-0000-0000-0000-000000001002', 'Transferências', 'expense', '#9ca3af', 'ArrowRightLeft', NULL, '20000000-0000-0000-0000-000000000010'),
  ('20000000-0000-0000-0000-000000001003', 'Não Identificado', 'expense', '#d1d5db', 'HelpCircle', NULL, '20000000-0000-0000-0000-000000000010');

-- ========================================================
-- Verificar inserção
-- ========================================================
SELECT
  c.id,
  c.name,
  c.type,
  c.color,
  c.icon,
  p.name as parent_name,
  CASE WHEN c.parent_id IS NULL THEN 'PAI' ELSE 'FILHO' END as nivel
FROM categories c
LEFT JOIN categories p ON c.parent_id = p.id
WHERE c.user_id IS NULL
ORDER BY
  CASE WHEN c.parent_id IS NULL THEN c.id ELSE c.parent_id END,
  c.parent_id NULLS FIRST,
  c.name;

-- ========================================================
-- Resultado Esperado:
-- 1 categoria pai de receita + 6 subcategorias = 7 receitas
-- 10 categorias pai de despesa + 42 subcategorias = 52 despesas
-- Total: 59 categorias padrão
-- ========================================================
