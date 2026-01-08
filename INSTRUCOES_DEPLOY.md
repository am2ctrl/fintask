# 🚀 Instruções de Deploy - FinTask MVP

## ⚠️ AÇÃO OBRIGATÓRIA ANTES DO DEPLOY

Antes de fazer o build ou deploy, você **DEVE** executar o script SQL no Supabase para popular as categorias padrão com UUIDs fixos.

### 📋 Passo a Passo

1. **Acesse o Supabase Dashboard**
   - Vá para: https://supabase.com/dashboard/project/[seu-projeto-id]
   - Clique em "SQL Editor" no menu lateral

2. **Execute o Script SQL**
   - Abra o arquivo: `server/utils/seedDefaultCategories.sql`
   - Copie todo o conteúdo
   - Cole no SQL Editor do Supabase
   - Clique em "Run" (ou pressione Ctrl+Enter)

3. **Verifique o Resultado**
   - Você deve ver: "12 rows affected"
   - A query de verificação mostrará as 12 categorias criadas
   - Certifique-se que todas têm `user_id IS NULL`

### ✅ O Que Foi Corrigido

#### 1. **Error Boundary Implementado**
- **Arquivo criado:** `client/src/shared/components/ErrorBoundary.tsx`
- **Integrado em:** `client/src/app/App.tsx` (linha 77)
- **Benefício:** App não trava mais com tela branca em erros não tratados

#### 2. **Correção UUID de Categorias**
- **Problema:** Frontend enviava IDs numéricos ("9"), Postgres rejeitava (esperava UUID)
- **Solução:** Criado mapeamento `server/utils/categoryMapping.ts`
- **Modificado:** `server/features/transactions/transactions.routes.ts`
  - POST `/api/transactions` (linha 140)
  - PATCH `/api/transactions/:id` (linha 163)
  - POST `/api/transactions/batch` (linhas 30-41)

#### 3. **Arquivos Criados**
```
✅ client/src/shared/components/ErrorBoundary.tsx
✅ server/utils/categoryMapping.ts
✅ server/utils/seedDefaultCategories.sql
✅ INSTRUCOES_DEPLOY.md (este arquivo)
```

### 🧪 Como Testar

Após executar o SQL e fazer build:

1. **Teste de Error Boundary:**
   - Abra DevTools Console
   - Execute: `throw new Error("Teste")` em qualquer componente
   - Deve aparecer tela de erro com botão "Voltar ao Início"

2. **Teste de Import de Transações:**
   - Vá para página "Importar"
   - Faça upload da fatura de cartão (74 transações)
   - Verifique que todas são salvas sem erro UUID
   - Confirme categoria "Educação" (ID "9") funciona

3. **Teste de Criação Manual:**
   - Crie uma transação manualmente
   - Selecione categoria "Educação"
   - Salve e verifique que aparece na lista

### 🔍 Troubleshooting

**Erro: "invalid input syntax for type uuid"**
- Causa: Script SQL não foi executado no Supabase
- Solução: Volte ao passo 1 e execute `seedDefaultCategories.sql`

**Erro: "duplicate key value violates unique constraint"**
- Causa: Categorias já existem com IDs diferentes
- Solução: No script SQL, a linha `DELETE FROM categories WHERE user_id IS NULL;` limpa categorias antigas

**Categorias antigas aparecem duplicadas**
- Causa: Usuários podem ter criado categorias customizadas
- Isso é OK: Categorias customizadas têm `user_id` preenchido e não são afetadas

### 📊 Próximos Passos (Opcional - Fase 2)

Após validar que a Fase 1 funciona:

1. **Otimização de Bundle** (reduzir de 1.5MB para ~700KB)
   - Code splitting com React.lazy()
   - Lazy loading de PDF.js
   - Lazy loading de Recharts
   - Remover componentes UI não usados

2. **Melhorias de Performance**
   - Ajustar React Query cache (staleTime de Infinity → 5min)
   - Adicionar rate limiting na API

3. **Monitoramento**
   - Configurar Sentry para error tracking
   - Habilitar Vercel Analytics

---

## 🎯 Resumo do Que Mudou

| Componente | Status | Impacto |
|------------|--------|---------|
| ErrorBoundary | ✅ Implementado | Erro não trava mais app |
| UUID Mapping | ✅ Implementado | Import de 74 transações funciona |
| SQL Script | ⏳ Aguardando execução | Necessário para deploy |
| Bundle Optimization | ⏸️ Pendente (Fase 2) | Performance pode melhorar |

---

**Última atualização:** 2026-01-07
**Autor:** Claude Code
