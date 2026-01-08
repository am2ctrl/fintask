-- =============================================================
-- Migrar Transações Antigas com categoryId Numérico para UUID
-- =============================================================
--
-- IMPORTANTE: Execute este script ANTES de fazer novos imports
--
-- Este script corrige transações antigas que têm category_id
-- com valores numéricos ("1", "2", "9", etc.) ao invés de UUIDs
--
-- =============================================================

-- PASSO 1: Ver quais transações têm categoryId inválido (não UUID)
SELECT id, description, category_id, date, amount
FROM transactions
WHERE user_id = 'e37b5028-9a68-4545-96ae-615f96fcd896'
  AND LENGTH(category_id) < 36  -- UUIDs têm 36 caracteres
ORDER BY date DESC
LIMIT 100;

-- PASSO 2: Atualizar categoryId numérico para UUID correspondente
-- Receitas
UPDATE transactions SET category_id = '11111111-1111-1111-1111-111111111111' WHERE category_id = '1' AND user_id = 'e37b5028-9a68-4545-96ae-615f96fcd896';  -- Salário
UPDATE transactions SET category_id = '22222222-2222-2222-2222-222222222222' WHERE category_id = '2' AND user_id = 'e37b5028-9a68-4545-96ae-615f96fcd896';  -- Freelance
UPDATE transactions SET category_id = '33333333-3333-3333-3333-333333333333' WHERE category_id = '3' AND user_id = 'e37b5028-9a68-4545-96ae-615f96fcd896';  -- Investimentos
UPDATE transactions SET category_id = '44444444-4111-1111-1111-111111111111' WHERE category_id = '4' AND user_id = 'e37b5028-9a68-4545-96ae-615f96fcd896';  -- Outros (receita)

-- Despesas
UPDATE transactions SET category_id = '55555555-5555-5555-5555-555555555555' WHERE category_id = '5' AND user_id = 'e37b5028-9a68-4545-96ae-615f96fcd896';  -- Alimentação
UPDATE transactions SET category_id = '66666666-6666-6666-6666-666666666666' WHERE category_id = '6' AND user_id = 'e37b5028-9a68-4545-96ae-615f96fcd896';  -- Transporte
UPDATE transactions SET category_id = '77777777-7777-7777-7777-777777777777' WHERE category_id = '7' AND user_id = 'e37b5028-9a68-4545-96ae-615f96fcd896';  -- Moradia
UPDATE transactions SET category_id = '88888888-8888-8888-8888-888888888888' WHERE category_id = '8' AND user_id = 'e37b5028-9a68-4545-96ae-615f96fcd896';  -- Saúde
UPDATE transactions SET category_id = '99999999-9999-9999-9999-999999999999' WHERE category_id = '9' AND user_id = 'e37b5028-9a68-4545-96ae-615f96fcd896';  -- Educação ← ESTE ERA O ERRO!
UPDATE transactions SET category_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' WHERE category_id = '10' AND user_id = 'e37b5028-9a68-4545-96ae-615f96fcd896'; -- Lazer
UPDATE transactions SET category_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' WHERE category_id = '11' AND user_id = 'e37b5028-9a68-4545-96ae-615f96fcd896'; -- Contas
UPDATE transactions SET category_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc' WHERE category_id = '12' AND user_id = 'e37b5028-9a68-4545-96ae-615f96fcd896'; -- Compras

-- PASSO 3: Verificar se ainda há transações com categoryId inválido
SELECT COUNT(*) as remaining_invalid
FROM transactions
WHERE user_id = 'e37b5028-9a68-4545-96ae-615f96fcd896'
  AND LENGTH(category_id) < 36;

-- PASSO 4: (OPCIONAL) Se aparecer alguma transação órfã, deletar
-- Descomente as linhas abaixo APENAS se quiser deletar transações com categoria inválida
-- DELETE FROM transactions
-- WHERE user_id = 'e37b5028-9a68-4545-96ae-615f96fcd896'
--   AND LENGTH(category_id) < 36;

-- =============================================================
-- RESULTADO ESPERADO:
-- - PASSO 1: Mostra transações com categoryId numérico
-- - PASSO 2: Atualiza todas para UUIDs corretos
-- - PASSO 3: Deve retornar "remaining_invalid = 0"
-- =============================================================
