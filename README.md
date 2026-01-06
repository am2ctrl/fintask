# FinTask - Gestão Financeira Familiar Inteligente

![License MIT](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Status](https://img.shields.io/badge/status-production--ready-success)

Sistema completo de gestão financeira para famílias brasileiras, focado em **automação** e **inteligência**. O FinTask elimina o trabalho manual de planilhas importando extratos bancários e faturas de cartão via IA (GPT-4 / Gemini).

---

## 🚀 Funcionalidades Principais

### 🧠 Importação Inteligente (IA)

* **Upload de PDF**: Suporte nativo para extratos bancários e faturas.
* **Reconhecimento Automático**: Extrai data, valor, descrição e **parcelas**.
* **Categorização Inteligente**: IA sugere categorias baseadas no histórico e contexto.
* **Alta Precisão**: Detecta estornos, pix, transferências e pagamentos de fatura.

### 📊 Dashboard & Analytics

* Visão clara de Receitas vs Despesas.
* Distribuição de gastos por categoria (Gráfico de Rosca).
* Evolução mensal e fluxo de caixa.
* Filtros avançados (data, conta, cartão).

### 💳 Gestão de Cartões

* Controle de múltiplos cartões de crédito.
* Visualização de limite e fechamento.
* Associação automática de compras ao cartão correto na importação.

### 🏷️ Categorias

* Sistema flexível de categorias (Receita/Despesa).
* Ícones e cores personalizáveis.
* Categorias padrão otimizadas para finanças pessoais brasileiras.

---

## 🏗️ Arquitetura Moderna (Feature-Based)

O projeto foi recentemente refatorado para uma arquitetura escalável **Feature-Based**, facilitando manutenção e testes.

### Tech Stack

**Frontend:**

* **React 18** + TypeScript + Vite
* **TanStack Query** (Server State)
* **Tailwind CSS** + **shadcn/ui** (Design System)
* **Wouter** (Routing leve)
* **Recharts** (Visualização de dados)

**Backend:**

* **Node.js** + Express
* **TypeScript** (Strict Mode)
* **Supabase** (PostgreSQL + Auth + RLS)
* **Google Gemini / OpenAI** (IA Engine)

### Estrutura de Pastas

```
fintask/
├── client/src/
│   ├── features/              # Módulos auto-contidos
│   │   ├── auth/              # Login, Sessão
│   │   ├── transactions/      # Listagem, CRUD
│   │   ├── import/            # Upload, IA, Preview
│   │   ├── dashboard/         # Gráficos, KPI
│   │   ├── categories/        # Gestão de categorias
│   │   └── cards/             # Gestão de cartões
│   └── shared/                # Componentes UI, Hooks, Libs
│
└── server/
    ├── features/              # Backend modularizado
    │   ├── transaction/       # Rotas e Services
    │   ├── import/            # Parsers e IA Logic
    │   └── ...
    └── core/                  # Config, Middlewares
```

---

## 🛠️ Configuração e Instalação

### Pré-requisitos

* Node.js 18+
* Conta no Supabase (Gratuito)
* Chave API Google Gemini (Recomendado) ou OpenAI

### 1. Clone o repositório

```bash
git clone https://github.com/am2ctrl/fintask.git
cd fintask
```

### 2. Instale dependências

```bash
npm install
```

### 3. Variáveis de Ambiente

Crie um arquivo `.env` na raiz:

```env
# Database & Auth
SUPABASE_URL=sua_url_supabase
SUPABASE_ANON_KEY=sua_key_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_key_service_role
SESSION_SECRET=segredo_super_secreto

# AI Service (Opcional - Importação)
GOOGLE_GEMINI_API_KEY=sua_chave_gemini
# ou
AI_INTEGRATIONS_OPENAI_API_KEY=sua_chave_openai
```

### 4. Setup do Banco de Dados

Execute o script SQL fornecido (`supabase-schema.sql`) no Editor SQL do seu painel Supabase para criar as tabelas e políticas de segurança (RLS).

### 5. Executar

```bash
# Modo Desenvolvimento
npm run dev

# Build Produção
npm run build
npm start
```

---

## 📦 Deploy (Vercel)

O projeto está configurado para deploy "Zero Config" na Vercel.

1. Conecte seu repositório GitHub na Vercel.
2. Importe o projeto.
3. Configure as variáveis de ambiente no painel da Vercel.
4. Deploy! 🚀

---

## 🤝 Contribuição

1. Faça um Fork.
2. Crie uma branch (`git checkout -b feature/NovaFeature`).
3. Commit suas mudanças (`git commit -m 'Add: Nova Feature'`).
4. Push (`git push origin feature/NovaFeature`).
5. Abra um Pull Request.

---

## 📄 Licença

Distribuído sob a licença **MIT**. Veja `LICENSE` para mais informações.
