# FinTask - Gestão Financeira Familiar

## Overview

FinTask is a family financial management web application built for Brazilian Portuguese users. It provides personal finance tracking without requiring authentication, focusing on simplicity and clarity for managing income, expenses, and financial visualization. The app features transaction management, category organization, credit card tracking, and AI-powered bank statement import functionality.

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

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful endpoints under `/api` prefix
- **Build Process**: esbuild for server bundling, Vite for client

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` for shared type definitions
- **Validation**: Zod with drizzle-zod integration
- **Current Storage**: In-memory storage implementation in `server/storage.ts` (database connection ready via Drizzle config)

### Key Design Patterns
- **Shared Types**: Common schemas in `shared/` directory accessible by both client and server via path aliases
- **Component Examples**: Each custom component has an example file in `client/src/components/examples/` for documentation
- **Path Aliases**: `@/` for client source, `@shared/` for shared code, `@assets/` for attached assets

### AI Integration
- **Provider**: OpenAI API for transaction extraction from bank statements
- **Feature**: Parses PDF/text bank statements and categorizes transactions automatically
- **Batch Processing**: Utility in `server/replit_integrations/batch/` for rate-limited API calls

## External Dependencies

### Database
- **PostgreSQL**: Configured via `DATABASE_URL` environment variable
- **Drizzle Kit**: Schema migrations in `./migrations` directory

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