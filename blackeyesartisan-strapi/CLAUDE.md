# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Project**: BlackEyesArtisan - Strapi CMS backend
**Purpose**: Headless CMS managing content for the BlackEyesArtisan eCommerce storefront (content pages, policies, global settings, blog, collections, etc.)
**Framework**: Strapi v5.0.1
**Database**: PostgreSQL (production) / SQLite (development)
**Storage**: DigitalOcean Spaces (S3-compatible) for media assets
**Node Version**: 18.0.0 - 20.x.x

## Development Commands

### Setup & Development
```bash
npm install                    # Install dependencies
npm run develop               # Start Strapi in development mode with hot reload (port 1337)
npm run build                 # Build the admin panel and API
npm run start                 # Start Strapi in production mode (no auto-reload)
npm run strapi                # Direct Strapi CLI access for advanced operations
```

### Common Development Tasks

**Access Admin Panel**: Navigate to `http://localhost:1337/admin` after running `develop`

**Check TypeScript Compilation**:
```bash
npx tsc --noEmit               # Check for TypeScript errors without building
```

## Project Structure

```
src/
├── api/                       # Content Type APIs (generated from Strapi UI)
│   ├── [content-type]/        # Each content type has its own folder
│   │   ├── content-types/     # Schema definitions (JSON)
│   │   ├── controllers/       # API endpoint handlers (minimal, use factories)
│   │   ├── routes/            # API route definitions (use factories)
│   │   └── services/          # Business logic (use factories)
│   └── ...                    # Examples: blog, collection, homepage, faq, etc.
├── components/                # Reusable content components (nested in content types)
│   ├── about-us/              # Component group for About Us page
│   ├── homepage/              # Component group for Homepage
│   ├── faq/                   # Component group for FAQ
│   └── color-image/           # Component group for color/image pairs
├── admin/                     # Admin panel customization (React)
│   ├── app.example.tsx        # Example admin app configuration
│   └── tsconfig.json          # Admin-specific TypeScript config
├── index.ts                   # Bootstrap and register hooks
└── [excluded from build]: plugins/, admin configs

config/
├── database.ts                # Database connection config (supports SQLite, MySQL, PostgreSQL)
├── server.ts                  # Server host/port and app keys
├── api.ts                     # REST API default limits (25 items, max 100)
├── plugins.ts                 # Plugin configuration (upload provider = AWS S3)
├── middlewares.ts             # Security & CORS middleware (CSP policy configured)
└── admin.ts                   # Admin panel configuration

types/                        # Custom TypeScript type definitions (if any)
database/                     # Database migrations and seed data
public/                       # Static assets
```

## Content Type Architecture

### Content Types (collectionType vs singleType)

**Collection Types** (multiple instances):
- `blog` - Blog posts with title, slug, content, featured image, categories
- `blog-post-category` - Blog post categories
- `collection` - Product collections/categories
- `product-variant-color` - Color variants with hex codes and images

**Single Types** (one instance per environment):
- `homepage` - Homepage hero, sections, CTAs
- `about-us` - About page with story, craftsmanship, metrics, banners
- `faq` - FAQ page with questions/answers
- `privacy-policy` - Privacy policy content
- `terms-and-condition` - Terms and conditions content

### Component System

Components are reusable content blocks organized by domain. Located in `src/components/`:
- `about-us/content-section` - Reusable content + image section
- `about-us/why-us` - Why Us section with reasons
- `about-us/numerical-content` - Stats/metrics display
- `color-image` - Color hex + image pair
- `color-hex` - Single color definition
- `homepage/hero-banner` - Hero banner block
- `homepage/cta` - Call-to-action section
- `faq/faq-question` - FAQ question/answer pair

**Pattern**: Use components for repeatable content blocks. Access via REST API using `?populate=*` for nested data.

## API Endpoints & Data Fetching

### REST API Basics
- Base URL: `http://localhost:1337/api`
- Default limit: 25 items
- Max limit: 100 items
- All responses include `count` metadata

### Common Endpoints
```
GET  /api/blogs                       # List all blog posts
GET  /api/blogs?populate=*            # Include nested relations/components
GET  /api/blogs/:id                   # Get single blog post
GET  /api/collections                 # List all collections
GET  /api/homepage                    # Get single type (no ID needed)
GET  /api/faq?populate=*              # Get FAQ with all nested components
```

### Populate Strategy
- Use `?populate=*` for full data inclusion (nested relations, components, media)
- Use `?populate=field1,field2` for selective population
- Media fields automatically include URL and metadata

### Authentication
- Public read access configured for storefront queries
- Admin Panel protected with JWT (stored in browser)
- API tokens available in admin panel for server-to-server auth

## Database Configuration

### Local Development (Default: SQLite)
- Database file: `.tmp/data.db`
- No setup required, created automatically
- Good for local testing

### Production (PostgreSQL)
- Configure via environment variables: `DATABASE_URL` or individual settings
- Credentials: `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`
- SSL support available via `DATABASE_SSL`

### Environment Variables
See `.env.example` for all required variables:
- **Server**: `HOST`, `PORT`, `APP_KEYS`
- **Database**: `DATABASE_CLIENT`, `DATABASE_URL`, `DATABASE_*`
- **Secrets**: `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `JWT_SECRET`, `TRANSFER_TOKEN_SALT`
- **Storage**: `DO_SPACE_*` (DigitalOcean Spaces credentials)

Never commit `.env` with real credentials.

## Storage & Media Handling

### DigitalOcean Spaces (S3-Compatible)
- Provider: AWS S3 plugin configured for DO Spaces
- Configuration in `config/plugins.ts`
- Credentials in `.env`: `DO_SPACE_ACCESS_KEY`, `DO_SPACE_SECRET_KEY`, `DO_SPACE_BUCKET`, `DO_SPACE_ENDPOINT`
- Root path configurable via `DO_SPACE_PATH`
- Public URL: `SPACE_URL` environment variable

### Media Upload
- Strapi admin panel handles direct upload
- Supported types: Images (PNG, JPG, etc.), files
- Media metadata (size, URL, alt text) automatically stored

## Customization Patterns

### Adding a New Content Type
1. Use Strapi Admin UI to create content type or modify `src/api/[name]/content-types/[name]/schema.json`
2. Strapi auto-generates controller/route/service using `factories.createCore*()` pattern
3. Default endpoints available immediately after build

### Custom Controllers/Services
- Controllers extend with `factories.createCoreController()` for custom endpoint logic
- Services extend with `factories.createCoreService()` for business logic
- Example pattern (from existing code):
```typescript
import { factories } from '@strapi/strapi'
export default factories.createCoreController('api::blog.blog');
```

### Middleware & Hooks
- Custom middleware defined in `config/middlewares.ts`
- Security: CSP policy configured for media domains (DO Spaces, CDN)
- Bootstrap logic in `src/index.ts` for app-wide initialization

## Security & Performance

### Content Security Policy (CSP)
- Configured in `config/middlewares.ts`
- Image sources: DO Spaces URL, CDN, blob, data URIs
- Media sources: DO Spaces URL, blob, data URIs
- Connect sources: HTTPS only

### API Rate Limiting
- Default: 25 items per request
- Maximum: 100 items per request
- Configure in `config/api.ts`

### Best Practices
- Always populate nested relations explicitly (avoids N+1 queries)
- Use limit/offset pagination for large datasets
- Cache API responses on storefront side (Next.js ISR/revalidation)
- Keep media files optimized before upload

## TypeScript & Compilation

### Type Safety
- Target: ES2019, Module: CommonJS
- Strict mode disabled (Strapi default), but use type annotations where possible
- JSON schema files are included in build (for content type definitions)

### Compilation
```bash
npx tsc --noEmit                      # Check types without building
npm run build                         # Builds admin panel + transpiles TS to dist/
```

### Excluded from Build
- `src/admin/` (admin panel, handled separately)
- `src/plugins/` (custom plugins folder, if used)
- Test files (`*.test.*`)

## Integration with Storefront

This Strapi instance serves as the headless CMS for the Next.js storefront. Key integration points:

- **Revalidation**: Storefront listens to Strapi webhooks for cache invalidation
- **Webhook endpoint**: `POST /api/strapi-revalidate` on storefront (handled by Next.js)
- **API consumption**: Storefront queries Strapi REST API for pages, policies, global settings, blog content
- **Media delivery**: All images proxied through DO Spaces (configured in both CMS and storefront)

## Testing & Verification

After making changes:
```bash
npm run build                 # Ensure admin panel builds without errors
npm run develop              # Verify dev server starts and content accessible via API
```

## Debugging

### Admin Panel Issues
- Check browser console for client-side errors
- Check terminal for server-side errors
- Admin should be accessible at `http://localhost:1337/admin`

### API Issues
- Use Postman/Insomnia to test REST endpoints
- Check API response format with `?populate=*`
- Verify authentication tokens if accessing protected routes

### Database Issues
- SQLite: Check `.tmp/data.db` exists
- PostgreSQL: Verify connection string and credentials in `.env`
- Run migrations if needed: Check Strapi admin for pending migrations

## Common Development Tasks

### Querying Single vs Collection Types
```javascript
// Single type (Homepage, Privacy Policy, etc.)
GET /api/homepage?populate=*

// Collection type (Blog posts, Collections, etc.)
GET /api/blogs?populate=*&limit=10&start=0
```

### Adding Media to a Content Type
1. Define media field in schema.json: `"type": "media"`
2. Populate in queries: `?populate=MediaFieldName`
3. Response includes: URL, size, mime type, etc.

### Working with Components
- Components are nested within content types
- Access via standard populate: `?populate=ComponentFieldName.*`
- Repeatable components return arrays

### Publishing Content
- Draft and Publish plugin enabled on most content types
- Unpublished content excludes from API by default
- Use admin panel to publish/unpublish

## Architecture Decisions

### Why Strapi as Headless CMS?
- Decoupled from storefront (Next.js can update independently)
- Flexible content modeling without code changes (admin UI)
- Built-in media management and optimization
- Easy webhook integration for cache invalidation

### Factory Pattern Usage
- Strapi provides `factories` to generate standard CRUD controllers/routes/services
- Reduces boilerplate; modify only when custom logic needed
- Safe defaults prevent accidental security issues

---

For the latest Strapi documentation, visit [strapi.io/documentation](https://strapi.io/documentation).
