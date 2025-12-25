# FinTask - Gestao Financeira Familiar

## Overview

FinTask is a comprehensive family financial management web application built specifically for Brazilian Portuguese users. It enables families to track income, expenses, and investments in one centralized platform. The standout feature is AI-powered bank statement import that extracts ALL transactions from PDF statements, letting users decide which ones to import.

**Key Features:**
- Manual and AI-assisted transaction entry
- Bank statement and credit card bill import via GPT-4
- Interactive dashboard with charts and KPIs
- Multi-card management with family member tracking
- Transaction modes: avulsa (one-time), recorrente (recurring), parcelada (installments)
- Row Level Security for data privacy per user

## Documentation

- **PRD.md** - Complete Product Requirements Document with personas, user journeys, and functional requirements
- **README.md** - Detailed installation guide, architecture, and troubleshooting

## User Preferences

- Preferred communication style: Simple, everyday language (Portuguese)
- All UI text in Brazilian Portuguese
- Currency: BRL (Real Brasileiro)
- Date format: DD/MM/YYYY

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, Vite as build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens, light/dark theme support
- **Charts**: Recharts for data visualization (pie charts, area charts)
- **PDF Processing**: pdfjs-dist for extracting text from bank statements
- **Authentication**: Supabase Auth with session management via AuthContext

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful endpoints under `/api` prefix with JWT authentication
- **Build Process**: esbuild for server bundling, Vite for client
- **Authentication Middleware**: JWT verification on all protected routes

### Data Layer
- **Database**: Supabase PostgreSQL (cloud-hosted)
- **Storage**: `server/supabaseStorage.ts` uses Supabase service_role for secure CRUD
- **Validation**: Zod schemas for request validation
- **Row Level Security (RLS)**: Enabled on all tables for user data isolation

### AI Integration
- **Provider**: OpenAI GPT-4 API
- **Feature**: Extracts ALL transactions from bank statements (PDF)
- **Categorization**: Automatic category suggestion based on description patterns
- **Transaction Modes**: Identifies recurring, installment, or one-time transactions
- **User Control**: Preview all extracted transactions, select which to import

## Key Files

### Backend
- `server/routes.ts` - API route definitions including AI extraction endpoint
- `server/authMiddleware.ts` - JWT authentication middleware
- `server/supabaseStorage.ts` - Database operations layer
- `server/supabase.ts` - Supabase client initialization

### Frontend
- `client/src/App.tsx` - Main app with routing and sidebar
- `client/src/pages/Dashboard.tsx` - Main dashboard with KPIs and charts
- `client/src/pages/Transactions.tsx` - Transaction list with filters
- `client/src/pages/Import.tsx` - AI-powered statement import
- `client/src/pages/Cards.tsx` - Credit card management
- `client/src/pages/Categories.tsx` - Category management
- `client/src/pages/Login.tsx` - Authentication page
- `client/src/contexts/AuthContext.tsx` - Authentication state
- `client/src/components/StatementUpload.tsx` - PDF upload and text extraction
- `client/src/components/ExtractedTransactionPreview.tsx` - Review extracted transactions
- `client/src/components/TransactionModal.tsx` - Add/edit transaction form

### Configuration
- `supabase-schema.sql` - Database schema (run in Supabase SQL Editor)
- `design_guidelines.md` - UI/UX design guidelines

## Routes

| Path | Page | Description |
|------|------|-------------|
| `/` | Dashboard | Main dashboard with KPIs and charts |
| `/transacoes` | Transactions | List and manage transactions |
| `/importar` | Import | Upload and import bank statements |
| `/cartoes` | Cards | Manage credit cards |
| `/categorias` | Categories | Manage categories |
| `/login` | Login | Authentication (signup/signin) |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List all categories |
| POST | `/api/categories` | Create category |
| PATCH | `/api/categories/:id` | Update category |
| DELETE | `/api/categories/:id` | Delete category |
| GET | `/api/transactions` | List user transactions |
| POST | `/api/transactions` | Create transaction |
| POST | `/api/transactions/batch` | Create multiple transactions |
| PATCH | `/api/transactions/:id` | Update transaction |
| DELETE | `/api/transactions/:id` | Delete transaction |
| GET | `/api/cards` | List credit cards |
| POST | `/api/cards` | Create card |
| PATCH | `/api/cards/:id` | Update card |
| DELETE | `/api/cards/:id` | Delete card |
| POST | `/api/extract-transactions` | Extract transactions via AI |

## Environment Variables

### Required
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key (frontend)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (backend)
- `SESSION_SECRET` - Express session secret

### Optional (for AI import)
- `AI_INTEGRATIONS_OPENAI_API_KEY` - OpenAI API key
- `AI_INTEGRATIONS_OPENAI_BASE_URL` - OpenAI base URL

## Database Setup

Run `supabase-schema.sql` in Supabase SQL Editor to create:

1. **categories** - 24 default Brazilian Portuguese categories
2. **transactions** - User transactions with mode support
3. **credit_cards** - Credit card management
4. RLS policies for data isolation

## Development Notes

### Adding New Pages
1. Create file in `client/src/pages/`
2. Add route in `client/src/App.tsx`
3. Add sidebar link in `client/src/components/AppSidebar.tsx`

### Adding New API Routes
1. Add route in `server/routes.ts`
2. Use `authMiddleware` for protected routes
3. Implement storage operation in `server/supabaseStorage.ts`

### Transaction Modes
- **avulsa**: One-time purchase
- **recorrente**: Monthly recurring (Netflix, rent, etc.)
- **parcelada**: Installment purchase (shows X/Y)

### PDF Import Flow
1. User uploads PDF via StatementUpload component
2. pdfjs-dist extracts text from PDF
3. Text sent to GPT-4 for transaction extraction
4. User previews ALL extracted transactions
5. User selects which transactions to import
6. Selected transactions saved via batch endpoint
