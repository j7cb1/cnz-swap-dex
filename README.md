# Next.js Base Template

A production-ready Next.js template with authentication, clean architecture, and AI-friendly documentation.

## Features

- **Next.js 16** with App Router and React 19
- **Authentication** via NextAuth v5 (email/password)
- **PostgreSQL** database with Drizzle ORM
- **Clean Architecture** with use-cases and repository patterns
- **TanStack Query** for server-side caching
- **shadcn/ui** components with Tailwind CSS v4
- **Pino** structured logging with sensitive data redaction
- **TypeScript** with Zod runtime validation
- **AI-Friendly** documentation in `.claude/` folder

## Quick Start

```bash
# Clone the template
git clone <your-repo-url> my-project
cd my-project

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your values

# Start PostgreSQL
docker compose -f docker/docker-compose.yml up -d

# Push database schema
npm run db:push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
├── app/                 # Next.js App Router
│   ├── (auth)/         # Login, Signup pages
│   └── (dashboard)/    # Protected routes
├── components/         # React components
│   ├── dashboard/      # Shell, sidebar, header
│   └── ui/            # shadcn/ui primitives
├── repositories/       # Data access layer (Drizzle)
├── use-cases/         # Business logic
├── utilities/         # Shared utilities
├── services/          # External services (logger)
├── config/            # App configuration
├── docker/            # Docker compose files
├── docs/              # Pattern documentation
└── .claude/           # AI documentation
```

## Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

npm run db:push      # Push schema to database
npm run db:generate  # Generate migrations
npm run db:migrate   # Run migrations
npm run db:studio    # Open Drizzle Studio (GUI)
```

## Architecture

### Layers

1. **Presentation** - Next.js pages and React components
2. **Server Actions** - `*-action.ts` files with `'use server'`
3. **Business Logic** - Use cases in `use-cases/`
4. **Data Access** - Repositories in `repositories/`
5. **Database** - PostgreSQL via Drizzle ORM

### Key Patterns

- **FunctionResult** - All use cases return `{ data, error }`
- **Soft Deletes** - Use `deletedAt` timestamp instead of hard deletes
- **Role-Based Access** - `admin`, `support`, `member` roles
- **Server-Side Caching** - TanStack Query with automatic deduplication

## Adding New Features

See `docs/TEMPLATE_USAGE.md` for a step-by-step guide on adding new domains (tables, repos, use cases, components, pages).

## Documentation

- `docs/project-pattern/` - Architecture patterns
- `docs/TEMPLATE_USAGE.md` - How to extend the template
- `.claude/` - AI-friendly documentation for Claude

## Tech Stack

- **Framework**: Next.js 16, React 19
- **Language**: TypeScript 5
- **Database**: PostgreSQL 16 + Drizzle ORM
- **Auth**: NextAuth v5 (beta)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **State**: TanStack React Query
- **Validation**: Zod
- **Logging**: Pino

## License

MIT
