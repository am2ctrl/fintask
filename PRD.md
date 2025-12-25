# PRD - Product Requirements Document
## FinTask - Gestão Financeira Familiar

**Versão:** 1.0  
**Data:** Dezembro 2025  
**Status:** Em Desenvolvimento  

---

## 1. Visão do Produto

### 1.1 Resumo Executivo

O **FinTask** é uma aplicação web de gestão financeira familiar desenvolvida especificamente para o mercado brasileiro. O sistema permite que famílias acompanhem suas receitas, despesas e investimentos de forma centralizada, com recursos de importação inteligente de extratos bancários usando Inteligência Artificial.

### 1.2 Problema a Resolver

Famílias brasileiras enfrentam dificuldades em:
- Consolidar informações financeiras de múltiplas fontes (bancos, cartões)
- Categorizar manualmente centenas de transações mensais
- Visualizar o panorama financeiro familiar de forma clara
- Acompanhar gastos de diferentes membros da família
- Identificar padrões de consumo e oportunidades de economia

### 1.3 Solução Proposta

Uma plataforma web que:
- Centraliza todas as movimentações financeiras da família
- Utiliza IA para extrair e categorizar transações automaticamente de extratos bancários
- Oferece visualizações claras através de dashboards interativos
- Permite controle granular de cartões de crédito por membro da família
- Funciona com acesso restrito apenas para membros convidados (privacidade familiar)

### 1.4 Métricas de Sucesso

| Métrica | Meta | Descrição |
|---------|------|-----------|
| Taxa de adoção | 80% | Usuários que completam o onboarding |
| Precisão da IA | 85% | Transações categorizadas corretamente pela IA |
| Engajamento | 3x/semana | Frequência média de acesso por usuário |
| Retenção | 70% | Usuários ativos após 30 dias |
| Satisfação | NPS > 50 | Net Promoter Score |

---

## 2. Personas

### 2.1 Administrador Familiar (Persona Primária)

**Nome:** Marina, 38 anos  
**Ocupação:** Gerente Administrativa  
**Perfil:** Responsável pelas finanças da casa, casada, 2 filhos

**Objetivos:**
- Ter visão completa dos gastos familiares
- Identificar onde estão os maiores gastos
- Planejar orçamento mensal/anual
- Acompanhar faturas de cartões da família

**Dores:**
- Perde muito tempo categorizando extratos manualmente
- Não consegue ver gastos de todos os cartões em um só lugar
- Difícil identificar gastos desnecessários
- Planilhas de Excel são trabalhosas e propensas a erros

**Comportamento:**
- Acessa o sistema 4-5x por semana
- Prefere visualizações gráficas a tabelas
- Importa extratos bancários mensalmente
- Revisa categorias sugeridas pela IA

### 2.2 Membro Convidado

**Nome:** Ricardo, 42 anos  
**Ocupação:** Engenheiro de Software  
**Perfil:** Marido da Marina, usa cartões para compras pessoais e familiares

**Objetivos:**
- Registrar seus gastos pessoais
- Ver quanto gastou no mês
- Não ter trabalho excessivo com controle financeiro

**Dores:**
- Esquece de anotar gastos pequenos
- Não gosta de planilhas complexas

**Comportamento:**
- Acessa o sistema 1-2x por semana
- Prefere interface simples e rápida
- Adiciona transações manualmente quando lembra

### 2.3 Gestor Financeiro (Persona Secundária)

**Nome:** Carlos, 55 anos  
**Ocupação:** Contador aposentado  
**Perfil:** Pai de família que ajuda os filhos com finanças

**Objetivos:**
- Ensinar educação financeira para os filhos
- Acompanhar evolução patrimonial
- Identificar oportunidades de investimento

**Dores:**
- Sistemas muito complexos afastam a família
- Falta de histórico consolidado de longo prazo

**Comportamento:**
- Acessa semanalmente para análises
- Foco em relatórios e tendências
- Exporta dados para análises externas

---

## 3. Jornadas do Usuário

### 3.1 Jornada de Onboarding

```
┌─────────────┐    ┌──────────────┐    ┌────────────────┐    ┌──────────────┐
│  Cadastro   │───▶│  Verificação │───▶│  Configuração  │───▶│  Dashboard   │
│   Email     │    │    Email     │    │   Inicial      │    │   Inicial    │
└─────────────┘    └──────────────┘    └────────────────┘    └──────────────┘
                                              │
                                              ▼
                                    ┌────────────────────┐
                                    │ Criar categorias   │
                                    │ personalizadas     │
                                    │ (opcional)         │
                                    └────────────────────┘
```

**Passos:**
1. Usuário acessa a aplicação
2. Realiza cadastro com email e senha
3. Confirma email (Supabase Auth)
4. Acessa dashboard inicial (vazio)
5. Sistema oferece tour guiado
6. Usuário pode criar categorias personalizadas ou usar padrões

### 3.2 Jornada de Importação de Extrato

```
┌─────────────┐    ┌──────────────┐    ┌────────────────┐    ┌──────────────┐
│  Seleciona  │───▶│   Upload     │───▶│  Extração IA   │───▶│   Preview    │
│    Tipo     │    │   Arquivo    │    │  (GPT-4)       │    │  Transações  │
└─────────────┘    └──────────────┘    └────────────────┘    └──────────────┘
       │                                                            │
       │                                                            ▼
       │                                                   ┌────────────────┐
       │                                                   │ Revisar/Ajustar│
       │                                                   │ Categorias     │
       │                                                   └────────────────┘
       │                                                            │
       ▼                                                            ▼
┌─────────────────┐                                        ┌────────────────┐
│ Conta Corrente  │                                        │ Selecionar     │
│ ou Cartão       │                                        │ Transações     │
└─────────────────┘                                        └────────────────┘
                                                                    │
                                                                    ▼
                                                           ┌────────────────┐
                                                           │   Importar     │
                                                           │   Selecionadas │
                                                           └────────────────┘
```

**Passos:**
1. Usuário acessa página "Importar"
2. Escolhe tipo: Conta Corrente ou Cartão de Crédito
3. Faz upload do arquivo (PDF, CSV, TXT, OFX)
4. Sistema extrai texto do documento
5. IA (GPT-4) analisa e identifica transações
6. Sistema exibe preview com todas as transações encontradas
7. Usuário revisa categorias sugeridas
8. Usuário seleciona quais transações importar
9. Transações são salvas no banco de dados
10. Usuário é redirecionado para lista de transações

### 3.3 Jornada de Tracking Diário

```
┌─────────────┐    ┌──────────────┐    ┌────────────────┐
│  Dashboard  │───▶│ + Nova       │───▶│  Preencher     │
│             │    │ Transação    │    │  Formulário    │
└─────────────┘    └──────────────┘    └────────────────┘
       │                                       │
       │                                       ▼
       │                              ┌────────────────┐
       │                              │   Salvar       │
       │                              └────────────────┘
       │                                       │
       ▼                                       ▼
┌─────────────────┐                   ┌────────────────┐
│ Visualizar      │◀──────────────────│  Atualizar     │
│ Gráficos/KPIs   │                   │  Dashboard     │
└─────────────────┘                   └────────────────┘
```

### 3.4 Jornada de Reconciliação de Cartão

```
┌─────────────┐    ┌──────────────┐    ┌────────────────┐
│  Cartões    │───▶│ Selecionar   │───▶│ Ver Transações │
│             │    │ Cartão       │    │ do Cartão      │
└─────────────┘    └──────────────┘    └────────────────┘
       │                                       │
       ▼                                       ▼
┌─────────────────┐                   ┌────────────────┐
│ Cadastrar novo  │                   │ Filtrar por    │
│ cartão          │                   │ período/membro │
└─────────────────┘                   └────────────────┘
```

---

## 4. Requisitos Funcionais

### 4.1 Módulo: Autenticação e Convites

#### RF-AUTH-001: Cadastro de Usuário
**Descrição:** Permitir cadastro de novos usuários com email e senha.

**Critérios de Aceite:**
- [ ] Formulário com campos: email, senha, confirmar senha
- [ ] Validação de email único no sistema
- [ ] Senha com mínimo 6 caracteres
- [ ] Email de confirmação enviado automaticamente (Supabase)
- [ ] Mensagem de sucesso após cadastro
- [ ] Redirecionamento para login após confirmação

#### RF-AUTH-002: Login
**Descrição:** Permitir acesso de usuários cadastrados.

**Critérios de Aceite:**
- [ ] Formulário com email e senha
- [ ] Validação de credenciais via Supabase Auth
- [ ] Token JWT armazenado em sessão
- [ ] Redirecionamento para Dashboard após login
- [ ] Mensagem de erro para credenciais inválidas

#### RF-AUTH-003: Logout
**Descrição:** Permitir que usuário encerre sessão.

**Critérios de Aceite:**
- [ ] Botão de logout visível no menu
- [ ] Sessão encerrada no Supabase
- [ ] Token removido do cliente
- [ ] Redirecionamento para tela de login

#### RF-AUTH-004: Recuperação de Senha
**Descrição:** Permitir reset de senha por email.

**Critérios de Aceite:**
- [ ] Link "Esqueci minha senha" na tela de login
- [ ] Email de recuperação enviado via Supabase
- [ ] Link válido por 24 horas
- [ ] Nova senha deve ter mínimo 6 caracteres

### 4.2 Módulo: Gestão de Transações

#### RF-TRANS-001: Criar Transação Manual
**Descrição:** Permitir adicionar transações manualmente.

**Campos do Formulário:**
| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| Data | Date | Sim | Não pode ser futura > 1 ano |
| Descrição | Text | Sim | 3-200 caracteres |
| Valor | Number | Sim | > 0 |
| Tipo | Select | Sim | income / expense |
| Categoria | Select | Sim | Lista de categorias |
| Modo | Select | Sim | avulsa / recorrente / parcelada |
| Parcela Atual | Number | Condicional | Se modo = parcelada |
| Total Parcelas | Number | Condicional | Se modo = parcelada |
| Cartão | Select | Não | Lista de cartões cadastrados |

**Critérios de Aceite:**
- [ ] Modal com formulário completo
- [ ] Validação em tempo real
- [ ] Campos condicionais aparecem conforme seleção
- [ ] Salvar atualiza lista e dashboard
- [ ] Toast de confirmação após salvar

#### RF-TRANS-002: Listar Transações
**Descrição:** Exibir lista de transações com filtros.

**Critérios de Aceite:**
- [ ] Tabela paginada com transações
- [ ] Filtro por período (data início/fim)
- [ ] Filtro por tipo (receita/despesa)
- [ ] Filtro por categoria
- [ ] Filtro por cartão
- [ ] Ordenação por data, valor, descrição
- [ ] Exibição do total filtrado

#### RF-TRANS-003: Editar Transação
**Descrição:** Permitir edição de transações existentes.

**Critérios de Aceite:**
- [ ] Botão de editar em cada linha
- [ ] Modal com dados pré-preenchidos
- [ ] Validação igual à criação
- [ ] Atualização reflete imediatamente na lista

#### RF-TRANS-004: Excluir Transação
**Descrição:** Permitir exclusão de transações.

**Critérios de Aceite:**
- [ ] Botão de excluir em cada linha
- [ ] Confirmação antes de excluir (dialog)
- [ ] Exclusão lógica ou física conforme configuração
- [ ] Atualização imediata da lista e totais

#### RF-TRANS-005: Modos de Transação
**Descrição:** Suportar três modos de transação.

| Modo | Descrição | Comportamento |
|------|-----------|---------------|
| Avulsa | Compra única, sem repetição | Registro simples |
| Recorrente | Despesa fixa mensal | Marcador visual, sugestão de duplicação |
| Parcelada | Compra dividida em parcelas | Exibe X/Y (ex: 3/10) |

**Critérios de Aceite:**
- [ ] Badge visual diferente para cada modo
- [ ] Parceladas mostram número atual e total
- [ ] Filtro por modo disponível

### 4.3 Módulo: Importação Inteligente

#### RF-IMPORT-001: Upload de Arquivo
**Descrição:** Permitir upload de extratos bancários.

**Formatos Suportados:**
- PDF (extração de texto)
- CSV (parsing direto)
- TXT (parsing de texto)
- OFX (formato bancário padrão)

**Critérios de Aceite:**
- [ ] Área de drag-and-drop
- [ ] Botão de seleção de arquivo
- [ ] Limite de 10MB por arquivo
- [ ] Validação de formato
- [ ] Feedback de progresso durante upload

#### RF-IMPORT-002: Extração por IA
**Descrição:** Usar GPT-4 para extrair transações do texto.

**Critérios de Aceite:**
- [ ] Envio do texto extraído para API OpenAI
- [ ] Extração de TODAS as transações (não apenas algumas)
- [ ] Identificação de: data, descrição, valor, tipo
- [ ] Sugestão de categoria baseada na descrição
- [ ] Identificação de modo (avulsa/recorrente/parcelada)
- [ ] Detecção de parcelas (X/Y)
- [ ] Confidence score para cada transação
- [ ] Timeout de 60 segundos com retry

#### RF-IMPORT-003: Preview de Transações
**Descrição:** Exibir transações extraídas para revisão.

**Critérios de Aceite:**
- [ ] Lista com todas transações encontradas
- [ ] Checkbox para selecionar/deselecionar cada uma
- [ ] Botão "Selecionar Todas" / "Deselecionar Todas"
- [ ] Edição inline de categoria
- [ ] Indicador de confiança (alta/média/baixa)
- [ ] Distinção visual entre receitas e despesas
- [ ] Total selecionado exibido

#### RF-IMPORT-004: Confirmação de Importação
**Descrição:** Salvar transações selecionadas.

**Critérios de Aceite:**
- [ ] Botão "Importar Selecionadas"
- [ ] Validação de categorias atribuídas
- [ ] Salvamento em batch no banco de dados
- [ ] Feedback de sucesso com contagem
- [ ] Opção de fazer nova importação

### 4.4 Módulo: Categorias

#### RF-CAT-001: Categorias Padrão
**Descrição:** Sistema pré-configurado com categorias em português.

**Categorias de Receita:**
- Salário
- Freelance
- Investimentos
- Bônus
- Outros Receitas

**Categorias de Despesa:**
- Alimentação
- Transporte
- Moradia
- Saúde
- Educação
- Lazer
- Contas
- Compras
- Pet
- Assinaturas
- Viagem
- Roupas
- Beleza
- Presente
- Telefone
- Internet
- Streaming
- Banco
- Outros Despesas

#### RF-CAT-002: CRUD de Categorias
**Descrição:** Permitir gestão de categorias personalizadas.

**Critérios de Aceite:**
- [ ] Listar categorias (padrão + personalizadas)
- [ ] Criar categoria com nome, tipo, cor, ícone
- [ ] Editar categorias personalizadas
- [ ] Excluir categorias (apenas se não houver transações)
- [ ] Categorias padrão não podem ser editadas/excluídas

### 4.5 Módulo: Cartões de Crédito

#### RF-CARD-001: Cadastro de Cartão
**Descrição:** Registrar cartões de crédito da família.

**Campos:**
| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| Nome | Text | Sim |
| Últimos 4 dígitos | Text | Sim |
| Tipo | Select | Sim (físico/virtual) |
| Titular | Text | Sim |
| Finalidade | Text | Sim |
| Cor | Color | Sim |
| Ícone | Select | Sim |
| Limite | Number | Não |
| Dia de Fechamento | Number | Não (1-31) |
| Dia de Vencimento | Number | Não (1-31) |

**Critérios de Aceite:**
- [ ] Formulário modal completo
- [ ] Validação de campos obrigatórios
- [ ] Preview visual do cartão
- [ ] Limite opcional para controle

#### RF-CARD-002: Visualização de Cartões
**Descrição:** Exibir cartões cadastrados com resumo.

**Critérios de Aceite:**
- [ ] Cards visuais para cada cartão
- [ ] Exibição do titular e finalidade
- [ ] Total gasto no período atual
- [ ] Porcentagem do limite utilizado (se limite definido)
- [ ] Número de transações vinculadas

#### RF-CARD-003: Vincular Transação a Cartão
**Descrição:** Associar transações a cartões específicos.

**Critérios de Aceite:**
- [ ] Campo "Cartão" no formulário de transação
- [ ] Filtro de transações por cartão
- [ ] Relatório de gastos por cartão

### 4.6 Módulo: Dashboard Analítico

#### RF-DASH-001: KPIs Principais
**Descrição:** Exibir indicadores chave no topo do dashboard.

**KPIs:**
| Indicador | Cálculo | Cor |
|-----------|---------|-----|
| Receitas | Soma de income no período | Verde |
| Despesas | Soma de expense no período | Vermelho |
| Saldo | Receitas - Despesas | Verde/Vermelho |
| Economia | % do que sobrou vs receita | Azul |

**Critérios de Aceite:**
- [ ] Cards com valores formatados em BRL
- [ ] Ícones representativos
- [ ] Atualização em tempo real
- [ ] Comparativo com período anterior (%)

#### RF-DASH-002: Gráfico de Pizza por Categoria
**Descrição:** Distribuição de despesas por categoria.

**Critérios de Aceite:**
- [ ] Gráfico de pizza/donut interativo
- [ ] Cores correspondentes às categorias
- [ ] Legenda com valores e percentuais
- [ ] Tooltip ao passar o mouse
- [ ] Filtro por período

#### RF-DASH-003: Gráfico de Evolução Mensal
**Descrição:** Comparativo receitas x despesas ao longo do tempo.

**Critérios de Aceite:**
- [ ] Gráfico de área ou barras
- [ ] Linha de receitas (verde)
- [ ] Linha de despesas (vermelho)
- [ ] Eixo X: meses
- [ ] Eixo Y: valores em BRL
- [ ] Período configurável (3, 6, 12 meses)

#### RF-DASH-004: Lista de Transações Recentes
**Descrição:** Últimas transações registradas.

**Critérios de Aceite:**
- [ ] Lista com 5-10 últimas transações
- [ ] Exibição de data, descrição, categoria, valor
- [ ] Badge de tipo (receita/despesa)
- [ ] Link "Ver todas" para página de transações

#### RF-DASH-005: Tooltips Contextuais
**Descrição:** Dicas explicativas nos elementos do dashboard.

**Critérios de Aceite:**
- [ ] Ícone de ajuda (?) próximo a cada seção
- [ ] Tooltip com explicação ao hover
- [ ] Texto em português claro
- [ ] Não interferir no uso normal

---

## 5. Requisitos Não-Funcionais

### 5.1 Performance

| Métrica | Requisito |
|---------|-----------|
| Tempo de carregamento inicial | < 3 segundos |
| Resposta de API (CRUD) | < 500ms |
| Extração de PDF (IA) | < 30 segundos |
| Importação batch (100 transações) | < 5 segundos |

### 5.2 Disponibilidade

- **Uptime:** 99.5% (excluindo manutenções programadas)
- **Backup:** Diário via Supabase
- **Recuperação:** RTO < 4 horas, RPO < 24 horas

### 5.3 Segurança

| Requisito | Implementação |
|-----------|---------------|
| Autenticação | JWT via Supabase Auth |
| Autorização | Row Level Security (RLS) no Supabase |
| Dados em trânsito | HTTPS obrigatório |
| Dados em repouso | Criptografia Supabase |
| Isolamento | Usuário só acessa seus próprios dados |

### 5.4 Acessibilidade

- **Padrão:** WCAG 2.1 Nível AA
- **Navegação por teclado:** Todos elementos interativos
- **Contraste:** Mínimo 4.5:1 para texto
- **Responsividade:** Mobile-first design

### 5.5 Localização

- **Idioma:** Português do Brasil (pt-BR)
- **Moeda:** Real Brasileiro (BRL)
- **Formato de data:** DD/MM/YYYY
- **Fuso horário:** America/Sao_Paulo (padrão)

### 5.6 Compliance

- **LGPD:** 
  - Consentimento para coleta de dados
  - Direito de exclusão de dados
  - Transparência sobre uso de dados
  - Não compartilhamento com terceiros

---

## 6. Arquitetura Técnica

### 6.1 Stack Tecnológica

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND                           │
│  React + TypeScript + Vite + TanStack Query + Tailwind │
│  shadcn/ui + Recharts + Wouter + React Hook Form       │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                      BACKEND                            │
│         Node.js + Express + TypeScript                  │
│              JWT Auth Middleware                        │
└─────────────────────────────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
┌─────────────────────────┐  ┌─────────────────────────┐
│       SUPABASE          │  │        OPENAI           │
│  PostgreSQL + Auth      │  │      GPT-4 API          │
│  Row Level Security     │  │  Extração de Transações │
└─────────────────────────┘  └─────────────────────────┘
```

### 6.2 Estrutura de Diretórios

```
fintask/
├── client/                    # Frontend React
│   ├── src/
│   │   ├── components/        # Componentes reutilizáveis
│   │   │   ├── ui/           # shadcn/ui components
│   │   │   └── ...           # Componentes customizados
│   │   ├── contexts/         # React Contexts (Auth)
│   │   ├── hooks/            # Custom hooks
│   │   ├── lib/              # Utilitários (queryClient, supabase)
│   │   ├── pages/            # Páginas da aplicação
│   │   └── App.tsx           # Componente raiz
│   └── index.html
├── server/                    # Backend Express
│   ├── authMiddleware.ts     # Middleware JWT
│   ├── routes.ts             # Rotas da API
│   ├── supabase.ts           # Cliente Supabase
│   ├── supabaseStorage.ts    # Camada de dados
│   └── index.ts              # Entry point
├── shared/                    # Código compartilhado
│   └── schema.ts             # Tipos e schemas Zod
└── supabase-schema.sql       # DDL do banco de dados
```

### 6.3 Fluxo de Autenticação

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Cliente │────▶│ Supabase │────▶│   JWT    │────▶│  Backend │
│          │     │   Auth   │     │  Token   │     │   API    │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     │                                                   │
     │              Valida token                         │
     │◀──────────────────────────────────────────────────│
     │                                                   │
     │              Retorna dados                        │
     │◀──────────────────────────────────────────────────│
```

### 6.4 Fluxo de Importação IA

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Upload  │────▶│  Parse   │────▶│  OpenAI  │────▶│  Preview │
│   PDF    │     │  Text    │     │  GPT-4   │     │  Trans.  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                      │                                  │
                      │         Extrai todas             │
                      │         transações               │
                      │                                  │
                                                         │
┌──────────┐     ┌──────────┐                           │
│  Salvar  │◀────│ Seleciona│◀──────────────────────────│
│   Batch  │     │  Trans.  │
└──────────┘     └──────────┘
```

---

## 7. Modelo de Dados

### 7.1 Diagrama ER

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ id (UUID) PK    │
│ email           │
│ created_at      │
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐      ┌─────────────────┐
│  transactions   │      │   categories    │
├─────────────────┤      ├─────────────────┤
│ id (UUID) PK    │      │ id (UUID) PK    │
│ date            │ N:1  │ name            │
│ amount          │◀─────│ type            │
│ type            │      │ color           │
│ description     │      │ icon            │
│ mode            │      │ user_id FK      │
│ installment_num │      └─────────────────┘
│ installments_tot│
│ category_id FK  │
│ card_id FK      │      ┌─────────────────┐
│ user_id FK      │      │  credit_cards   │
└────────┬────────┘      ├─────────────────┤
         │               │ id (UUID) PK    │
         │ N:1           │ name            │
         └──────────────▶│ last_four_digits│
                         │ card_type       │
                         │ holder          │
                         │ purpose         │
                         │ color           │
                         │ icon            │
                         │ card_limit      │
                         │ closing_day     │
                         │ due_day         │
                         │ user_id FK      │
                         └─────────────────┘
```

### 7.2 Tabelas

#### users (gerenciado pelo Supabase Auth)
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Identificador único |
| email | VARCHAR | Email do usuário |
| created_at | TIMESTAMP | Data de criação |

#### categories
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Identificador único |
| name | TEXT | Nome da categoria |
| type | TEXT | 'income' ou 'expense' |
| color | TEXT | Cor hexadecimal |
| icon | TEXT | Nome do ícone Lucide |
| user_id | UUID | Proprietário (NULL = sistema) |
| created_at | TIMESTAMP | Data de criação |

#### transactions
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Identificador único |
| date | DATE | Data da transação |
| amount | NUMERIC | Valor em reais |
| type | TEXT | 'income' ou 'expense' |
| description | TEXT | Descrição |
| mode | TEXT | 'avulsa', 'recorrente', 'parcelada' |
| installment_number | INTEGER | Número da parcela atual |
| installments_total | INTEGER | Total de parcelas |
| category_id | UUID | FK para categories |
| card_id | UUID | FK para credit_cards (opcional) |
| user_id | UUID | Proprietário |
| created_at | TIMESTAMP | Data de criação |

#### credit_cards
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Identificador único |
| name | TEXT | Nome do cartão |
| last_four_digits | TEXT | Últimos 4 dígitos |
| card_type | TEXT | 'physical' ou 'virtual' |
| holder | TEXT | Nome do titular |
| purpose | TEXT | Finalidade |
| color | TEXT | Cor do card visual |
| icon | TEXT | Ícone representativo |
| card_limit | NUMERIC | Limite de crédito |
| closing_day | INTEGER | Dia de fechamento (1-31) |
| due_day | INTEGER | Dia de vencimento (1-31) |
| user_id | UUID | Proprietário |
| created_at | TIMESTAMP | Data de criação |

---

## 8. Roadmap

### Fase 1: MVP (Atual)
**Prazo:** Dezembro 2025

- [x] Autenticação Supabase
- [x] CRUD de transações
- [x] Categorias padrão
- [x] Dashboard básico com KPIs
- [x] Gráfico de pizza por categoria
- [x] Importação de PDF com IA
- [x] Gestão de cartões de crédito
- [ ] Modos de transação (avulsa/recorrente/parcelada)

### Fase 2: Melhorias
**Prazo:** Q1 2026

- [ ] Importação de CSV, TXT, OFX
- [ ] Convite de membros familiares
- [ ] Relatórios exportáveis (PDF/Excel)
- [ ] Metas de economia por categoria
- [ ] Notificações de vencimento de contas
- [ ] Histórico de importações

### Fase 3: Avançado
**Prazo:** Q2 2026

- [ ] App mobile (React Native)
- [ ] Integração Open Banking
- [ ] Previsão de gastos com ML
- [ ] Múltiplas moedas
- [ ] Backup/Restore de dados

---

## 9. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| IA com baixa precisão | Média | Alto | Preview obrigatório, edição manual |
| Diversidade de extratos | Alta | Médio | Prompt robusto, feedback loop |
| Limites Supabase free | Baixa | Alto | Monitoramento, upgrade quando necessário |
| Performance com muitos dados | Média | Médio | Paginação, índices, cache |
| Segurança de dados | Baixa | Crítico | RLS, JWT, HTTPS, auditorias |

---

## 10. Glossário

| Termo | Definição |
|-------|-----------|
| Transação | Movimentação financeira (receita ou despesa) |
| Categoria | Classificação de transação (ex: Alimentação, Transporte) |
| Modo | Tipo de recorrência (avulsa, recorrente, parcelada) |
| Parcela | Divisão de uma compra em múltiplos pagamentos |
| RLS | Row Level Security - segurança a nível de linha no banco |
| JWT | JSON Web Token - formato de token de autenticação |
| KPI | Key Performance Indicator - indicador chave |

---

## 11. Aprovações

| Papel | Nome | Data | Assinatura |
|-------|------|------|------------|
| Product Owner | | | |
| Tech Lead | | | |
| UX Designer | | | |
| Stakeholder | | | |

---

*Documento gerado automaticamente - FinTask v1.0*
