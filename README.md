# Quiz Funnel Application

A custom-coded quiz funnel web application for converting prospects into customers through an interactive quiz experience.

## Overview

This application provides:
- **Single-page quiz** with ultra-fast transitions (< 100ms)
- **Anonymous session management** (no authentication required)
- **Result calculation** and personalized product recommendations
- **Embedded Stripe checkout** (no redirects)
- **Full analytics** and event tracking

## Technology Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **State**: Zustand
- **Animations**: Framer Motion
- **UI Components**: shadcn/ui (planned)

### Backend
- **Runtime**: Node.js 18+ via Next.js
- **API**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **ORM**: Supabase JS Client

### External Services
- **Payments**: Stripe Payment Intents + Payment Element
- **Database**: Supabase Cloud
- **Hosting**: Vercel

## Prerequisites

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Supabase Account**: [Sign up here](https://supabase.com)
- **Stripe Account**: [Sign up here](https://stripe.com)
- **Vercel Account**: [Sign up here](https://vercel.com) (for deployment)

## Setup Instructions

### 1. Clone Repository

```bash
git clone [repository-url]
cd ADS
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Update `.env.local` with your actual values:

```env
# Supabase (get from: https://supabase.com/dashboard/project/_/settings/api)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe (get from: https://dashboard.stripe.com/test/apikeys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Setup

The database schema migration is located at `supabase/migrations/00001_initial_schema.sql`.

**Apply migration** (choose one method):

**Option A: Supabase CLI**
```bash
supabase db push
```

**Option B: Supabase Dashboard**
1. Go to SQL Editor in your Supabase project
2. Copy contents of `supabase/migrations/00001_initial_schema.sql`
3. Paste and execute

**Verify migration**:
- Check that all 8 tables exist: quizzes, quiz_questions, quiz_options, quiz_sessions, quiz_answers, quiz_results, orders, quiz_events

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build production bundle
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript compiler checks

## Project Structure

```
ADS/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API route handlers (backend)
│   │   ├── q/                 # Quiz pages (frontend)
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── quiz/             # Quiz UI components
│   │   ├── results/          # Result display components
│   │   └── checkout/         # Payment components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility libraries
│   │   ├── api/              # API client functions
│   │   ├── services/         # Business logic services
│   │   ├── stripe/           # Stripe integration
│   │   └── supabase/         # Database access layer
│   └── types/                 # TypeScript type definitions
│       ├── database.types.ts  # Database table types
│       ├── quiz.types.ts      # Quiz domain types
│       ├── api.types.ts       # API request/response types
│       ├── stripe.types.ts    # Stripe-related types
│       └── index.ts           # Barrel export
├── supabase/
│   └── migrations/            # Database migrations
├── __dev/                     # Development documentation
│   ├── __architecture.md      # System architecture
│   ├── _data_model.md        # Database schema
│   ├── _master_plan.md       # Implementation plan
│   ├── scope.md              # Project scope
│   └── tasks.md              # Task list
├── .claude/                   # Claude Code agent configs
│   ├── agents/               # Specialist agent definitions
│   ├── skills/               # Reusable skills
│   └── rules/                # Coding standards
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies and scripts
```

## Development Workflow

### Multi-Agent Development

This project uses **Claude Code** with specialized agents:

- **integration-specialist**: Types, Stripe, config, deployment
- **backend-specialist**: API endpoints, database, business logic
- **frontend-specialist**: UI components, state management, animations
- **qa-specialist**: Testing, validation, bug detection

See `.claude/CLAUDE.md` for agent details.

### Phase-Based Development

Development follows 8 phases:
1. Foundation & Setup (Current)
2. Quiz Data Layer & API
3. Quiz UI Components
4. Result Calculation & Display
5. Stripe Payment Integration
6. Integration & Testing
7. Analytics & Monitoring
8. Polish & Deployment

See `__dev/_master_plan.md` for full timeline.

## Architecture Highlights

### Single-URL Quiz Runtime
- Entire quiz runs under `/q/[quizSlug]`
- No page reloads between questions
- Instant transitions (< 100ms target)

### Anonymous Sessions
- No authentication required during quiz
- Session tracked via HttpOnly cookie
- Converts to registered user after purchase (optional)

### Server-Side Authority
- All business logic server-side
- Client is presentation layer only
- Prevents tampering and price manipulation

### Embedded Checkout
- Stripe Payment Element in quiz UI
- No redirect to Stripe Checkout
- Maintains user flow and branding

### Webhook-Driven Payments
- Stripe webhooks are source of truth
- Client success is provisional
- Orders marked "paid" only after webhook confirmation

## Database Schema

8 core tables:
- `quizzes` - Quiz definitions and configuration
- `quiz_questions` - Individual questions
- `quiz_options` - Answer choices
- `quiz_sessions` - Anonymous user sessions
- `quiz_answers` - User responses
- `quiz_results` - Calculated results
- `orders` - Purchase records
- `quiz_events` - Analytics event log

See `__dev/_data_model.md` for complete schema.

## API Endpoints

### Quiz API
- `POST /api/quiz/start` - Initialize quiz session
- `POST /api/quiz/answer` - Save answer
- `POST /api/quiz/complete` - Finish quiz and calculate result
- `GET /api/quiz/session` - Get session state

### Payment API
- `POST /api/payments/create-intent` - Create Stripe PaymentIntent
- `POST /api/payments/webhook` - Handle Stripe webhooks
- `GET /api/payments/status/:orderId` - Check payment status

### Analytics API
- `POST /api/analytics/track` - Track event
- `GET /api/analytics/funnel` - Get funnel metrics

## Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit        # Unit tests
npm run test:integration # Integration tests
npm run test:e2e        # End-to-end tests

# Coverage report
npm run test:coverage
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Configure environment variables
4. Deploy

### Environment Variables (Production)

Ensure all production environment variables are set in Vercel:
- Supabase production URL and keys
- Stripe live mode keys
- Production webhook secret

See `.env.example` for complete list.

## Performance Targets

- Page load: < 2s (Lighthouse)
- Question transitions: < 100ms
- API response: < 200ms (p95)
- Lighthouse score: > 90

## Security

- HttpOnly cookies for sessions
- Server-side validation for all mutations
- Webhook signature verification
- Service role key never exposed to client
- Input validation on all API endpoints

## Contributing

See `__dev/_master_plan.md` for development phases and task breakdown.

## License

[Your License]

## Support

For issues or questions, contact [your contact info].

---

Built with Next.js, TypeScript, Supabase, and Stripe.
