# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Project**: BlackEyesArtisan API - Medusa 2.0 commerce backend
**Framework**: Medusa JS (v2.12.5) - Headless commerce platform
**Language**: TypeScript
**Database**: PostgreSQL (with SQLite support for development)
**Job Queue**: Redis (Upstash in production)
**Email Provider**: Resend
**File Storage**: DigitalOcean Spaces (S3-compatible)
**Payments**: Stripe

This is the commerce backend that powers the BlackEyesArtisan eCommerce storefront. It handles products, inventory, cart/checkout, orders, regions, shipping, and integrations with external services (Stripe, Resend, DigitalOcean).

## Core Architecture

### Medusa Framework Structure

Medusa 2.0 uses a modular, workflow-driven architecture:

- **Modules**: Self-contained business logic units (e.g., Product, Fulfillment, Payment, Notification)
- **Workflows**: Orchestrate complex business processes as DAGs of steps
- **Jobs**: Asynchronous background tasks (email sending, webhooks, indexing)
- **Subscribers**: Event-driven handlers that react to domain events
- **API Routes**: Custom REST endpoints extending core Medusa APIs

### Directory Structure

```
src/
├── api/                    # REST API extensions
│   ├── admin/             # Admin API routes
│   ├── store/             # Store (customer-facing) API routes
│   │   ├── search/        # Product search with middleware & validation
│   │   └── custom/        # Custom endpoints
│   └── middlewares.ts     # Shared API middleware
├── modules/               # Custom business logic modules
│   └── resend/           # Notification module for Resend email service
│       ├── emails/       # Email templates (React Email)
│       ├── index.ts      # Module export
│       └── service.ts    # Resend notification implementation
├── workflows/            # Business process orchestration
│   ├── *-workflow.ts     # Workflow definitions (send-order-confirmation, etc.)
│   └── steps/            # Workflow step implementations
├── jobs/                 # Background job handlers
├── subscribers/          # Event subscription handlers (listen to domain events)
├── scripts/              # Utility scripts
│   ├── seed.ts          # Database seed with demo data
│   ├── add-admin.ts     # Create admin user
│   └── enable-search-engine.ts  # Enable search indexing
├── utils/               # Shared utilities
└── links/               # Data links (relationships between modules)

medusa-config.ts         # Medusa configuration (modules, providers, database)
```

## Development Workflow

### Setup & Installation

```bash
# Install dependencies (uses yarn by default)
npm install  # or yarn install

# Set up environment variables
cp .env.example .env.local
# Fill in DATABASE_URL, REDIS_URL, STRIPE_API_KEY, RESEND_API_KEY, etc.

# Initialize database (migrate + seed demo data)
npm run db:init
# or manually:
npm run db:migrate
npm run db:seed
```

### Running the Development Server

```bash
# Start Medusa in development mode (with hot reload)
npm run dev
# Server runs on http://localhost:3000

# The admin dashboard is available at http://localhost:3000/admin (if enabled)
```

### Building & Production

```bash
# Build the project
npm run build

# Start production server
npm start
```

### Database Commands

```bash
npm run db:migrate      # Run pending migrations
npm run db:rollback     # Rollback last migration
npm run db:sync-links   # Sync data links between modules
npm run db:seed         # Run seed script
```

### Data Seeding & Admin Setup

```bash
# Seed database with demo products, regions, shipping options, etc.
npm run seed

# Create an admin user (needed for admin dashboard access)
npm run add:admin

# Enable search engine indexing
npm run enable:search-engine
```

## Testing

### Test Commands

```bash
# Run all unit tests
npm run test:unit

# Run all HTTP integration tests (requires running backend)
npm run test:integration:http

# Run module integration tests
npm run test:integration:modules

# Run new test format (integration.spec.ts)
npm run test:integration:new

# Run tests serially (easier debugging)
node --experimental-vm-modules node_modules/jest/bin/jest.js --runInBand --forceExit
```

### Test Structure

Tests are organized by type:
- `**/__tests__/**/*.unit.spec.ts` - Unit tests (isolated logic)
- `integration-tests/http/*.spec.ts` - HTTP API tests
- `integration-tests/new/*.integration.spec.ts` - New integration format
- `src/modules/*/__tests__/**/*.ts` - Module-specific tests

Environment: Uses `.env.test` for test-specific configuration (test database, etc.)

## Key Customizations for BlackEyesArtisan

### Custom Resend Module
**Location**: `src/modules/resend/`

Custom notification module that sends transactional emails via Resend:
- Email templates in `emails/` (React Email components)
- Handles order confirmations, shipping updates, etc.
- Integrates with Medusa's notification workflow system

### Product Search API
**Location**: `src/api/store/search/`

Custom search endpoint with:
- Query validation (`validators.ts`)
- Middleware for filtering/sorting (`middlewares.ts`)
- Configuration for search fields (`query-config.ts`)

### Order Confirmation Workflow
**Location**: `src/workflows/send-order-confirmation-workflow.ts`

Orchestrates sending confirmation emails after order placement:
- Triggered on order completion
- Uses Resend notification module to send emails
- Implemented as a Medusa workflow with defined steps

### DigitalOcean Spaces File Storage
Configured in `medusa-config.ts`:
- S3-compatible file provider
- Used for product images, documents
- Credentials from `.env` (DO_SPACE_ACCESS_KEY, DO_SPACE_SECRET_KEY, etc.)

### Stripe Payment Integration
Configured in `medusa-config.ts`:
- Dynamically enabled if `STRIPE_API_KEY` and `STRIPE_WEBHOOK_SECRET` are set
- Handles payment processing and webhooks
- Integrated with Medusa's payment module system

## Configuration Files

### medusa-config.ts
Main Medusa configuration:
- Database connection (PostgreSQL)
- Module setup (Payment, Notification, File, Index)
- Provider configuration (Stripe, Resend, DigitalOcean)
- CORS settings for store/admin/auth APIs
- JWT and cookie secrets

### Environment Variables
Key variables (see `.env.example`):
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis/Upstash for job queue and caching
- `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET` - Stripe payment
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL` - Transactional email
- `DO_SPACE_*` - DigitalOcean Spaces file storage
- `STORE_CORS`, `ADMIN_CORS`, `AUTH_CORS` - CORS origins for client apps

## Common Development Tasks

### Adding a New API Endpoint

1. Create a new route file: `src/api/store/[route-name]/route.ts` (or `admin/` for admin routes)
2. Implement handler function (GET, POST, etc.)
3. Use Medusa's dependency injection to access modules:
   ```typescript
   import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

   export async function GET(req: MedusaRequest, res: MedusaResponse) {
     const productService = req.scope.resolve("productModuleService");
     // Use the service...
   }
   ```
4. Register the route in Medusa's routing system (automatic for `src/api/store/` and `src/api/admin/`)

### Creating a Custom Workflow

1. Create `src/workflows/[workflow-name].ts`
2. Define steps and orchestrate them:
   ```typescript
   import { createWorkflow } from "@medusajs/workflows-sdk";
   import { stepFunction } from "./steps/step-name";

   export const myWorkflow = createWorkflow("my-workflow", () => {
     // Define and connect steps
     const result = stepFunction({ input: "data" });
     return result;
   });
   ```
3. Register workflow and invoke it from other modules/API routes

### Subscribing to Events

1. Create a subscriber in `src/subscribers/`
2. Listen to domain events (order.placed, product.created, etc.):
   ```typescript
   import { SubscriberArgs } from "@medusajs/framework";

   export default async function handleOrderPlaced({ event, container }: SubscriberArgs<any>) {
     // Handle event
   }
   ```

### Modifying the Database Schema

1. Create a migration in `.medusa/server/migrations/`
2. Use TypeORM migration format or Medusa migration utilities
3. Run: `npm run db:migrate`

### Adding a Job

1. Create a job handler in `src/jobs/[job-name].ts`
2. Register in module configuration
3. Queue the job from workflows/subscribers/API routes

## API Integration Points

### Connected Services

**Storefront (Next.js)**
- Reads product data, cart, checkout via Medusa Admin API
- Receives order confirmations via email (Resend)
- Stripe webhooks for payment status

**CMS (Strapi)**
- Separate service; does not integrate directly with this backend
- Storefront reads from both Medusa (commerce) and Strapi (content)

**External Providers**
- **Stripe**: Payment processing, webhook handling
- **Resend**: Transactional email delivery
- **DigitalOcean Spaces**: Product image storage

## Deployment & Production

### Docker Setup
`Dockerfile` and `docker-compose.yml` available:
- Runs Medusa in production mode with PostgreSQL and Redis
- Uses `yarn db:migrate && yarn start` as entry point
- Customize `.env` before building

### Production Checklist

- [ ] Set `NODE_ENV=production` in deployment environment
- [ ] Configure valid PostgreSQL database (not SQLite)
- [ ] Set up Redis instance (Upstash in cloud)
- [ ] Generate strong `JWT_SECRET` and `COOKIE_SECRET`
- [ ] Configure Stripe credentials and webhook secret
- [ ] Set up Resend API key and verified sender email
- [ ] Configure DigitalOcean Spaces credentials
- [ ] Set CORS origins for connected storefronts
- [ ] Run database migrations on first deploy
- [ ] Enable search indexing: `npm run enable:search-engine`
- [ ] Monitor Redis and database connections

## Performance Considerations

- **Redis**: Used for job queue (Resend emails, webhooks) and caching
- **Search Index**: Enable search engine for fast product queries
- **File Storage**: DigitalOcean Spaces handles image serving (offload from API)
- **Batch Operations**: Use Medusa's bulk APIs for importing products/inventory

## Debugging Tips

- Check logs: `npm run dev` shows real-time logs
- Use `console.log` in workflows/subscribers (logs in job output)
- Inspect database directly: `psql postgresql://medusa:medusa@localhost/medusa`
- Test Redis: `redis-cli -u $REDIS_URL ping`
- Check Stripe webhook logs in Stripe dashboard
- Verify Resend email delivery in Resend dashboard

## Resources

- [Medusa Documentation](https://docs.medusajs.com)
- [Medusa API Reference](https://docs.medusajs.com/api)
- [Stripe Integration Guide](https://docs.medusajs.com/modules/payment)
- [Resend Email Documentation](https://resend.com/docs)
- [DigitalOcean Spaces Guide](https://docs.digitalocean.com/products/spaces/)
