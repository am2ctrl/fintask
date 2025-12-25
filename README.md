# FinTask - Gestao Financeira Familiar

Sistema completo de gestao financeira para familias brasileiras, com importacao inteligente de extratos bancarios usando IA.

---

## Indice

1. [Sobre o Projeto](#sobre-o-projeto)
2. [Funcionalidades](#funcionalidades)
3. [Arquitetura](#arquitetura)
4. [Pre-requisitos](#pre-requisitos)
5. [Instalacao](#instalacao)
6. [Configuracao](#configuracao)
7. [Executando o Projeto](#executando-o-projeto)
8. [Estrutura de Pastas](#estrutura-de-pastas)
9. [API Endpoints](#api-endpoints)
10. [Banco de Dados](#banco-de-dados)
11. [Importacao com IA](#importacao-com-ia)
12. [Desenvolvimento](#desenvolvimento)
13. [Troubleshooting](#troubleshooting)
14. [Roadmap](#roadmap)
15. [Contribuicao](#contribuicao)
16. [Licenca](#licenca)

---

## Sobre o Projeto

O **FinTask** e uma aplicacao web desenvolvida para ajudar familias brasileiras a gerenciar suas financas de forma simples e inteligente. O sistema permite:

- Registrar receitas e despesas manualmente
- Importar extratos bancarios e faturas de cartao usando Inteligencia Artificial
- Visualizar o panorama financeiro atraves de graficos e dashboards
- Gerenciar multiplos cartoes de credito por membro da familia
- Categorizar transacoes automaticamente

### Por que usar o FinTask?

- **Economia de tempo**: A IA extrai todas as transacoes do seu extrato automaticamente
- **Visao completa**: Dashboard com graficos mostra para onde vai seu dinheiro
- **Privacidade**: Acesso restrito apenas para membros convidados da familia
- **Simplicidade**: Interface em portugues, pensada para usuarios nao tecnicos
- **Gratuito**: Utiliza servicos com planos gratuitos (Supabase, OpenAI)

---

## Funcionalidades

### Dashboard
- Cards com resumo financeiro (Receitas, Despesas, Saldo)
- Grafico de pizza com distribuicao por categoria
- Grafico de evolucao mensal
- Lista de transacoes recentes
- Acesso rapido para adicionar transacao ou importar extrato

### Transacoes
- Cadastro manual com campos completos
- Tres modos: Avulsa, Recorrente, Parcelada
- Filtros por periodo, tipo, categoria
- Edicao e exclusao
- Vinculacao com cartao de credito

### Importacao Inteligente
- Upload de PDF (extratos bancarios e faturas)
- Extracao automatica via GPT-4
- Preview de todas as transacoes encontradas
- Selecao individual do que importar
- Sugestao automatica de categorias

### Categorias
- 24 categorias pre-configuradas em portugues
- Icones e cores personalizadas
- Separacao entre receitas e despesas
- Possibilidade de criar categorias personalizadas

### Cartoes de Credito
- Cadastro de multiplos cartoes (fisicos e virtuais)
- Identificacao do titular e finalidade
- Controle de limite e datas de fechamento/vencimento
- Visualizacao de gastos por cartao

### Autenticacao
- Login com email e senha
- Cadastro com confirmacao por email
- Sessao segura via JWT
- Isolamento de dados por usuario (RLS)

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND                           │
│  React 18 + TypeScript + Vite                          │
│  TanStack Query + Tailwind CSS + shadcn/ui             │
│  Recharts (graficos) + Wouter (rotas)                  │
└─────────────────────────────────────────────────────────┘
                           │
                           │ HTTP/REST
                           ▼
┌─────────────────────────────────────────────────────────┐
│                      BACKEND                            │
│  Node.js + Express + TypeScript                        │
│  JWT Authentication Middleware                          │
│  API RESTful                                           │
└─────────────────────────────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
┌─────────────────────────┐  ┌─────────────────────────┐
│       SUPABASE          │  │        OPENAI           │
│  - PostgreSQL           │  │  - GPT-4 API            │
│  - Authentication       │  │  - Extracao de texto    │
│  - Row Level Security   │  │  - Categorizacao        │
└─────────────────────────┘  └─────────────────────────┘
```

### Tecnologias Utilizadas

**Frontend:**
- React 18 com TypeScript
- Vite (build tool)
- TanStack Query (gerenciamento de estado servidor)
- Tailwind CSS (estilizacao)
- shadcn/ui (componentes)
- Recharts (graficos)
- Wouter (roteamento)
- React Hook Form + Zod (formularios)
- date-fns (manipulacao de datas)
- pdfjs-dist (extracao de texto de PDF)

**Backend:**
- Node.js
- Express
- TypeScript
- Supabase Client
- OpenAI SDK

**Banco de Dados:**
- PostgreSQL (via Supabase)
- Row Level Security (RLS)

**Autenticacao:**
- Supabase Auth
- JWT Tokens

---

## Pre-requisitos

Antes de comecar, voce precisara de:

1. **Node.js** (versao 18 ou superior)
   ```bash
   node --version  # deve mostrar v18.x.x ou superior
   ```

2. **Conta no Supabase** (gratuito)
   - Acesse: https://supabase.com
   - Crie um novo projeto

3. **Chave da API OpenAI** (opcional, para importacao IA)
   - Acesse: https://platform.openai.com
   - Crie uma API key

---

## Instalacao

### 1. Clone o repositorio

```bash
git clone https://github.com/seu-usuario/fintask.git
cd fintask
```

### 2. Instale as dependencias

```bash
npm install
```

### 3. Configure o Supabase

1. Acesse o dashboard do seu projeto Supabase
2. Va em **SQL Editor**
3. Crie uma nova query
4. Cole o conteudo do arquivo `supabase-schema.sql`
5. Execute a query

Isso criara:
- Tabela `categories` com categorias padrao
- Tabela `transactions` para transacoes
- Tabela `credit_cards` para cartoes
- Politicas RLS para seguranca

### 4. Configure as variaveis de ambiente

Crie um arquivo `.env` na raiz do projeto (ou configure os Secrets no Replit):

```env
# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# Sessao
SESSION_SECRET=uma-string-aleatoria-segura

# OpenAI (opcional, para importacao IA)
AI_INTEGRATIONS_OPENAI_API_KEY=sua-openai-key
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1
```

**Onde encontrar as chaves do Supabase:**
1. Acesse o dashboard do Supabase
2. Va em **Settings > API**
3. Copie:
   - `URL` para `SUPABASE_URL`
   - `anon public` para `SUPABASE_ANON_KEY`
   - `service_role` para `SUPABASE_SERVICE_ROLE_KEY`

---

## Configuracao

### Variaveis de Ambiente

| Variavel | Descricao | Obrigatorio |
|----------|-----------|-------------|
| `SUPABASE_URL` | URL do projeto Supabase | Sim |
| `SUPABASE_ANON_KEY` | Chave anonima do Supabase | Sim |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de servico do Supabase | Sim |
| `SESSION_SECRET` | Segredo para sessoes Express | Sim |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | Chave da API OpenAI | Nao* |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | URL base da API OpenAI | Nao* |

*Obrigatorio apenas para usar a funcionalidade de importacao com IA.

### Configuracao do Frontend

O frontend usa variaveis com prefixo `VITE_` (automaticamente configuradas no Replit):

```typescript
// client/src/lib/supabase.ts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

---

## Executando o Projeto

### Desenvolvimento

```bash
npm run dev
```

Isso iniciara:
- Backend Express na porta 5000
- Frontend Vite com hot reload
- Proxy configurado para API

Acesse: `http://localhost:5000`

### Producao

```bash
npm run build
npm start
```

---

## Estrutura de Pastas

```
fintask/
├── client/                      # Frontend React
│   ├── src/
│   │   ├── components/          # Componentes reutilizaveis
│   │   │   ├── ui/             # shadcn/ui (Button, Card, etc)
│   │   │   ├── AppSidebar.tsx  # Barra lateral
│   │   │   ├── CategoryBadge.tsx
│   │   │   ├── ExtractedTransactionPreview.tsx
│   │   │   ├── StatementUpload.tsx
│   │   │   ├── ThemeProvider.tsx
│   │   │   ├── ThemeToggle.tsx
│   │   │   └── TransactionModal.tsx
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx  # Contexto de autenticacao
│   │   ├── hooks/
│   │   │   └── use-toast.ts     # Hook para notificacoes
│   │   ├── lib/
│   │   │   ├── queryClient.ts   # Configuracao TanStack Query
│   │   │   ├── supabase.ts      # Cliente Supabase frontend
│   │   │   └── utils.ts         # Funcoes utilitarias
│   │   ├── pages/
│   │   │   ├── Cards.tsx        # Pagina de cartoes
│   │   │   ├── Categories.tsx   # Pagina de categorias
│   │   │   ├── Dashboard.tsx    # Pagina principal
│   │   │   ├── Import.tsx       # Pagina de importacao
│   │   │   ├── Login.tsx        # Pagina de login/cadastro
│   │   │   ├── Transactions.tsx # Pagina de transacoes
│   │   │   └── not-found.tsx    # Pagina 404
│   │   ├── App.tsx              # Componente raiz com rotas
│   │   ├── index.css            # Estilos globais + Tailwind
│   │   └── main.tsx             # Entry point
│   └── index.html
│
├── server/                       # Backend Express
│   ├── authMiddleware.ts        # Middleware de autenticacao JWT
│   ├── index.ts                 # Entry point do servidor
│   ├── routes.ts                # Definicao das rotas API
│   ├── supabase.ts              # Cliente Supabase backend
│   ├── supabaseStorage.ts       # Camada de acesso a dados
│   └── vite.ts                  # Configuracao Vite para dev
│
├── shared/                       # Codigo compartilhado
│   └── schema.ts                # Tipos TypeScript compartilhados
│
├── supabase-schema.sql          # DDL do banco de dados
├── package.json                 # Dependencias e scripts
├── tsconfig.json               # Configuracao TypeScript
├── tailwind.config.ts          # Configuracao Tailwind
├── vite.config.ts              # Configuracao Vite
├── PRD.md                      # Documento de requisitos
├── README.md                   # Este arquivo
└── replit.md                   # Configuracao Replit
```

---

## API Endpoints

### Autenticacao
A autenticacao e gerenciada pelo Supabase Auth no frontend.

### Categorias

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/api/categories` | Lista todas as categorias |
| POST | `/api/categories` | Cria nova categoria |
| PATCH | `/api/categories/:id` | Atualiza categoria |
| DELETE | `/api/categories/:id` | Remove categoria |

### Transacoes

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/api/transactions` | Lista transacoes do usuario |
| POST | `/api/transactions` | Cria nova transacao |
| POST | `/api/transactions/batch` | Cria multiplas transacoes |
| PATCH | `/api/transactions/:id` | Atualiza transacao |
| DELETE | `/api/transactions/:id` | Remove transacao |

### Cartoes

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/api/cards` | Lista cartoes do usuario |
| POST | `/api/cards` | Cria novo cartao |
| PATCH | `/api/cards/:id` | Atualiza cartao |
| DELETE | `/api/cards/:id` | Remove cartao |

### Importacao

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| POST | `/api/extract-transactions` | Extrai transacoes de texto via IA |

#### Exemplo de Request - Extracao

```json
POST /api/extract-transactions
{
  "text": "09/12/2025 TRANSFERENCIA PIX 16.720,00 C",
  "statementType": "checking"
}
```

#### Exemplo de Response

```json
{
  "transactions": [
    {
      "date": "2025-12-09",
      "description": "TRANSFERENCIA PIX",
      "amount": 16720,
      "type": "income",
      "category": "Outros",
      "confidence": 0.9,
      "mode": "avulsa",
      "installmentNumber": null,
      "installmentsTotal": null
    }
  ]
}
```

---

## Banco de Dados

### Diagrama ER

```
users (Supabase Auth)
  │
  ├──< categories
  │      - id (UUID)
  │      - name
  │      - type (income/expense)
  │      - color
  │      - icon
  │      - user_id
  │
  ├──< transactions
  │      - id (UUID)
  │      - date
  │      - amount
  │      - type (income/expense)
  │      - description
  │      - mode (avulsa/recorrente/parcelada)
  │      - installment_number
  │      - installments_total
  │      - category_id ──> categories
  │      - card_id ──> credit_cards
  │      - user_id
  │
  └──< credit_cards
         - id (UUID)
         - name
         - last_four_digits
         - card_type (physical/virtual)
         - holder
         - purpose
         - color
         - icon
         - card_limit
         - closing_day
         - due_day
         - user_id
```

### Row Level Security (RLS)

Todas as tabelas possuem RLS habilitado:

- **categories**: Usuario ve categorias do sistema (user_id = NULL) + suas proprias
- **transactions**: Usuario ve apenas suas transacoes
- **credit_cards**: Usuario ve apenas seus cartoes

---

## Importacao com IA

### Como Funciona

1. **Upload**: Usuario faz upload de PDF do extrato bancario
2. **Extracao de Texto**: pdfjs-dist extrai o texto do PDF
3. **Analise IA**: Texto e enviado para GPT-4 com prompt especializado
4. **Identificacao**: IA identifica todas as transacoes com:
   - Data
   - Descricao
   - Valor
   - Tipo (receita/despesa)
   - Categoria sugerida
   - Modo (avulsa/recorrente/parcelada)
   - Parcelas (se aplicavel)
5. **Preview**: Usuario ve todas as transacoes extraidas
6. **Selecao**: Usuario escolhe quais importar
7. **Salvamento**: Transacoes selecionadas sao salvas no banco

### Tipos de Arquivo Suportados

| Formato | Status | Notas |
|---------|--------|-------|
| PDF | Suportado | Extracao via pdfjs-dist |
| CSV | Planejado | Parsing direto |
| TXT | Planejado | Parsing de texto |
| OFX | Planejado | Formato bancario padrao |

### Prompt da IA

O prompt foi otimizado para:
- Extrair TODAS as transacoes, sem excecao
- Identificar rendimentos de investimento (mesmo valores pequenos)
- Detectar tarifas bancarias
- Reconhecer parcelas (X/Y)
- Categorizar baseado em padroes brasileiros

---

## Desenvolvimento

### Scripts Disponiveis

```bash
# Desenvolvimento com hot reload
npm run dev

# Build para producao
npm run build

# Iniciar em producao
npm start

# Verificar tipos TypeScript
npm run check
```

### Padrao de Codigo

- **TypeScript**: Tipos estritos habilitados
- **ESLint**: Verificacao de codigo
- **Prettier**: Formatacao automatica (recomendado)

### Adicionando Novas Funcionalidades

1. **Nova Pagina**:
   - Crie arquivo em `client/src/pages/`
   - Adicione rota em `client/src/App.tsx`
   - Adicione link no sidebar `client/src/components/AppSidebar.tsx`

2. **Nova Rota API**:
   - Adicione em `server/routes.ts`
   - Use `authMiddleware` para rotas autenticadas
   - Implemente operacao em `server/supabaseStorage.ts`

3. **Novo Componente**:
   - Crie em `client/src/components/`
   - Use shadcn/ui como base quando possivel
   - Siga padroes de acessibilidade

---

## Troubleshooting

### Erros Comuns

#### "invalid input syntax for type uuid"
**Causa**: Categoria com ID incorreto sendo enviada.
**Solucao**: Verifique se as categorias estao sendo buscadas do banco de dados.

#### "Setting up fake worker" no PDF
**Causa**: Worker do pdfjs-dist nao configurado.
**Solucao**: Use o worker local:
```typescript
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();
```

#### Transacoes nao aparecem apos importacao
**Causa**: Erro no batch save.
**Solucao**: Verifique os logs do servidor para erros de validacao.

#### IA extraindo poucas transacoes
**Causa**: Prompt nao enfatizando extracao completa.
**Solucao**: O prompt foi atualizado para extrair TODAS as transacoes.

#### Erro de autenticacao 401
**Causa**: Token JWT expirado ou invalido.
**Solucao**: Faca logout e login novamente.

### Logs

**Servidor**: Logs aparecem no console do terminal.

**Frontend**: Use o DevTools do navegador (F12 > Console).

---

## Roadmap

### Versao 1.0 (Atual)
- [x] Autenticacao com Supabase
- [x] CRUD de transacoes
- [x] Dashboard com graficos
- [x] Importacao de PDF com IA
- [x] Gestao de cartoes
- [x] Categorias padrao PT-BR

### Versao 1.1 (Planejado)
- [ ] Suporte a CSV, TXT, OFX
- [ ] Convite de membros familiares
- [ ] Filtros avancados
- [ ] Exportacao de relatorios

### Versao 2.0 (Futuro)
- [ ] App mobile
- [ ] Open Banking
- [ ] Metas de economia
- [ ] Previsao de gastos com ML

---

## Contribuicao

Contribuicoes sao bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudancas (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Diretrizes

- Siga os padroes de codigo existentes
- Adicione testes quando possivel
- Atualize a documentacao se necessario
- Descreva suas mudancas no PR

---

## Licenca

Este projeto esta sob a licenca MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

## Contato

Para duvidas ou sugestoes, abra uma issue no GitHub.

---

*Desenvolvido com React, TypeScript, Supabase e OpenAI*
