# PropertyPipeline - Refurb Projects Module

## Overview
A refurbishment project pricing module designed for PropertyPipeline CRM (EspoCRM-based SaaS). Centrally hosted stateless UI that proxies all data operations to the user's own EspoCRM instance via their existing auth session. No local database — all refurb project data is stored as a custom RefurbProject entity in each customer's EspoCRM.

## Architecture
- **Frontend**: React SPA with EspoCRM-inspired UI (no sidebar, clean panel-based layout)
- **Backend**: Express.js API proxy — forwards CRUD requests to user's EspoCRM REST API
- **Data Storage**: Custom RefurbProject entity in each user's EspoCRM instance (no local database)
- **Auth**: EspoCRM session token passed via URL hash fragment, forwarded as Espo-Authorization header
- **Hosting**: Centrally hosted (single deployment for all customers)

## Auth Flow
1. User clicks "Refurb Projects" button on an Opportunity/Lead in EspoCRM
2. Button handler calls `Espo.Ajax.getRequest('RefurbAuth')` to retrieve the HttpOnly `auth-token-secret` cookie via a server-side API endpoint
3. Gets username from EspoCRM user object (`this.view.getUser().get('userName')`) and auth-token from cookies
4. Constructs base64 Espo-Authorization value (username:token)
5. Opens new tab with auth + authSecret in URL hash fragment (not sent to servers, not logged)
6. React app reads hash, stores auth in memory, clears URL
7. All API calls include x-espo-url, x-espo-auth, and x-espo-secret custom headers
8. Express backend proxies to EspoCRM REST API with Espo-Authorization header + auth-token-secret cookie
9. EspoCRM 8.x requires both the auth header AND the auth-token-secret cookie for authentication

## Key Features
- Refurb project CRUD via EspoCRM API proxy
- Dynamic line items with description, quantity, unit cost, VAT rate
- Automatic calculations: net total, VAT amount, grand total per line and overall
- Multiple VAT rates: 0% (exempt), 5% (reduced), 20% (standard)
- Associate projects with Opportunity, Lead, Contact, or Account entities
- Status workflow: Draft, Approved, In Progress, Completed, Cancelled
- Project duplication
- GBP/EUR/USD currency support
- Mobile-responsive: card-based line items and project list on small screens
- EspoCRM integration: URL param context, "Back to CRM" link, entity pre-fill
- Connection required screen when no CRM credentials present

## EspoCRM Integration
- **Custom Entity**: RefurbProject entity with all fields (installed in each EspoCRM instance)
- **Relationships**: Many-to-one links from RefurbProject to Lead and Opportunity (Property)
- **Bottom Panels**: Lead and Opportunity detail views show "Refurb Projects" relationship panel
- **Button**: Custom button on Opportunity/Lead detail views opens this app in new tab
- **Auth**: Seamless — uses existing EspoCRM session, no re-login needed
- **Auth Secret**: Custom `/api/v1/RefurbAuth` endpoint retrieves HttpOnly auth-token-secret cookie server-side
- **Data Flow**: App backend → EspoCRM REST API (no local database)
- **Integration files**: `espocrm-integration/` directory with complete installation package

## File Structure
- `shared/schema.ts` - Zod validation schemas and TypeScript types (no Drizzle)
- `server/storage.ts` - EspoCRMStorage class (proxies to EspoCRM REST API)
- `server/routes.ts` - API endpoints (extract auth headers, delegate to EspoCRMStorage)
- `client/src/pages/project-list.tsx` - List view (table on desktop, cards on mobile)
- `client/src/pages/project-detail.tsx` - Detail view
- `client/src/pages/project-form.tsx` - Create/edit form with EspoCRM context pre-fill
- `client/src/pages/connection-required.tsx` - Shown when no CRM credentials
- `client/src/components/espo-header.tsx` - Breadcrumb header with Back to CRM link
- `client/src/components/espo-panel.tsx` - Collapsible panel
- `client/src/components/line-item-table.tsx` - Line items (table on desktop, cards on mobile)
- `client/src/components/status-badge.tsx` - Status badge component
- `client/src/lib/calculations.ts` - Line item & totals calculations
- `client/src/lib/format.ts` - Currency & date formatting
- `client/src/lib/espo-context.ts` - Parse URL params/hash for EspoCRM context and auth
- `client/src/lib/queryClient.ts` - API client with EspoCRM auth header injection
- `espocrm-integration/` - EspoCRM installation files and instructions

## API Endpoints (Proxy)
- `GET /api/refurb-projects` - List all projects (proxied to EspoCRM)
- `GET /api/refurb-projects/:id` - Get project by ID
- `POST /api/refurb-projects` - Create project
- `PATCH /api/refurb-projects/:id` - Update project (server-side total recalculation)
- `DELETE /api/refurb-projects/:id` - Delete project

All endpoints require `x-espo-url` and `x-espo-auth` headers. Returns 401 if missing.

## Design Notes
- Opens in new browser tab from EspoCRM (best mobile support, avoids iframe issues)
- Panel-based layout matching EspoCRM's native detail/edit views
- No sidebar - standalone pages accessible via URL
- Mobile-responsive: card layouts, icon-only buttons, reduced padding
- Color scheme: main bg #F1F3F5, panels/tables white, buttons #FCFCFC
- Stateless backend — no local database, no user data stored centrally
