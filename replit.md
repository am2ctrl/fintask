# FinTask - Gestão Financeira Familiar

## Overview

FinTask is a family financial management web application built for Brazilian Portuguese users. It provides personal finance tracking with secure authentication, focusing on simplicity and clarity for managing income, expenses, and financial visualization. The app features transaction management, category organization, credit card tracking, and AI-powered bank statement import functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state, local React state for UI
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens, supporting light/dark themes
- **Charts**: Recharts for data visualization (pie charts, area charts)
- **Authentication**: Supabase Auth with session management via AuthContext

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful endpoints under `/api` prefix with JWT authentication
- **Build Process**: esbuild for server bundling, Vite for client
- **Authentication Middleware**: JWT verification on all protected routes (`server/authMiddleware.ts`)

### Data Layer
- **Database**: Supabase PostgreSQL (cloud-hosted)
- **Storage**: `server/supabaseStorage.ts` uses Supabase service_role for secure CRUD operations
- **Schema Location**: `shared/schema.ts` for shared type definitions
- **Validation**: Zod with drizzle-zod integration
- **Row Level Security (RLS)**: Enabled on all tables for data isolation per user

### Key Design Patterns
- **Shared Types**: Common schemas in `shared/` directory accessible by both client and server via path aliases
- **Component Examples**: Each custom component has an example file in `client/src/components/examples/` for documentation
- **Path Aliases**: `@/` for client source, `@shared/` for shared code, `@assets/` for attached assets
- **Secure API**: Backend extracts userId from verified JWT tokens - no client-side userId spoofing possible

### AI Integration
- **Provider**: OpenAI API for transaction extraction from bank statements
- **Feature**: Parses PDF/text bank statements and categorizes transactions automatically
- **Transaction Modes**: Identifies "recorrente" (recurring), "parcelada" (installments), or "avulsa" (one-time)
- **Batch Processing**: Utility in `server/replit_integrations/batch/` for rate-limited API calls

## Supabase Setup (REQUIRED)

To use the application, you must create the database tables in Supabase:

1. Go to your Supabase project dashboard
2. Navigate to "SQL Editor"
3. Create a new query and paste the contents of `supabase-schema.sql`
4. Execute the query to create tables and default categories

The schema creates:
- `categories` table with default Brazilian Portuguese categories
- `transactions` table with mode fields (recorrente/parcelada/avulsa)
- `credit_cards` table for card management
- Row Level Security policies for data isolation

## External Dependencies

### Supabase
- **URL**: Configured via `SUPABASE_URL` secret
- **Anon Key**: Configured via `SUPABASE_ANON_KEY` secret (frontend auth)
- **Service Role Key**: Configured via `SUPABASE_SERVICE_ROLE_KEY` secret (backend operations)
- **Session Secret**: Configured via `SESSION_SECRET` for Express sessions

### AI Services
- **OpenAI API**: Used for extracting and categorizing transactions from bank statements
- **Environment Variables**: `AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`

### Third-Party Libraries
- **UI Components**: Full shadcn/ui suite with Radix UI primitives
- **Date Handling**: date-fns with Portuguese locale
- **File Processing**: PDF text extraction for bank statement imports
- **Form Handling**: React Hook Form with Zod resolvers

### Development Tools
- **TypeScript**: Strict mode enabled
- **Vite Plugins**: Replit-specific plugins for development (cartographer, dev-banner, error overlay)

## Key Files

- `server/supabase.ts` - Supabase client initialization and token verification
- `server/authMiddleware.ts` - JWT authentication middleware for API routes
- `server/supabaseStorage.ts` - Storage implementation using Supabase
- `client/src/lib/supabase.ts` - Frontend Supabase client
- `client/src/contexts/AuthContext.tsx` - Authentication state management
- `client/src/pages/Login.tsx` - Login/Signup page
- `supabase-schema.sql` - Database schema to run in Supabase SQL Editor
