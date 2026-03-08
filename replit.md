# PropertyPipeline - Refurb Projects Module

## Overview
A refurbishment project pricing module designed for PropertyPipeline CRM (EspoCRM-based SaaS). Allows users to create, manage, and price refurbishment projects with line items, VAT calculations, and entity associations. Centrally hosted, opens in a new tab from EspoCRM entity detail views.

## Architecture
- **Frontend**: React SPA with EspoCRM-inspired UI (no sidebar, clean panel-based layout)
- **Backend**: Express.js API with PostgreSQL storage
- **Database**: PostgreSQL via Drizzle ORM
- **Styling**: Tailwind CSS with Open Sans font, EspoCRM color palette
- **Integration**: Opens in new tab from EspoCRM, receives entity context via URL params
- **Hosting**: Centrally hosted (single deployment for all customers)

## Key Features
- Refurb project CRUD with list view, detail view, create/edit forms
- Dynamic line items with description, quantity, unit cost, VAT rate
- Automatic calculations: net total, VAT amount, grand total per line and overall
- Multiple VAT rates: 0% (exempt), 5% (reduced), 20% (standard)
- Associate projects with Property, Lead, Contact, or Account entities
- Status workflow: Draft, Approved, In Progress, Completed, Cancelled
- Project duplication
- GBP/EUR/USD currency support
- Mobile-responsive: card-based line items and project list on small screens
- EspoCRM integration: URL param context, "Back to CRM" link, entity pre-fill

## EspoCRM Integration
- **Approach**: Custom button on Property/Lead detail views opens this app in new tab
- **URL Params**: `?entityType=Property&entityId=xxx&entityName=xxx&espoUrl=https://crm.example.com`
- **Pre-fill**: When creating a project from CRM, entity fields and project name are pre-populated
- **Back to CRM**: Header shows "Back to CRM" link when espoContext params are present
- **Integration files**: `espocrm-integration/` directory contains:
  - Metadata JSON files for Property and Lead clientDefs (custom button)
  - JS view handlers that construct the URL and open the new tab
  - `INSTALL.md` with step-by-step installation instructions

## Data Model
- `refurb_projects` table with JSONB `line_items` column
- Line items stored as JSON array within each project
- Totals stored as numeric fields (subtotal, vatTotal, grandTotal)

## File Structure
- `shared/schema.ts` - Drizzle schema + Zod validation
- `server/db.ts` - Database connection
- `server/storage.ts` - Storage interface (DatabaseStorage)
- `server/routes.ts` - API endpoints
- `server/seed.ts` - Seed data (4 realistic UK property refurb projects)
- `client/src/pages/project-list.tsx` - List view (table on desktop, cards on mobile)
- `client/src/pages/project-detail.tsx` - Detail view
- `client/src/pages/project-form.tsx` - Create/edit form with EspoCRM context pre-fill
- `client/src/components/espo-header.tsx` - Breadcrumb header with Back to CRM link
- `client/src/components/espo-panel.tsx` - Collapsible panel
- `client/src/components/line-item-table.tsx` - Line items (table on desktop, cards on mobile)
- `client/src/components/status-badge.tsx` - Status badge component
- `client/src/lib/calculations.ts` - Line item & totals calculations
- `client/src/lib/format.ts` - Currency & date formatting
- `client/src/lib/espo-context.ts` - Parse URL params for EspoCRM context
- `espocrm-integration/` - EspoCRM installation files and instructions

## API Endpoints
- `GET /api/refurb-projects` - List all projects
- `GET /api/refurb-projects/:id` - Get project by ID
- `POST /api/refurb-projects` - Create project
- `PATCH /api/refurb-projects/:id` - Update project
- `DELETE /api/refurb-projects/:id` - Delete project

## Design Notes
- Opens in new browser tab from EspoCRM (best mobile support, avoids iframe issues)
- Panel-based layout matching EspoCRM's native detail/edit views
- Uses collapsible panels, breadcrumb navigation, and CRM-style field layouts
- No sidebar - standalone pages accessible via URL
- Mobile-responsive: all pages adapt to small screens with card layouts, icon-only buttons, reduced padding
- Color scheme: main bg #F1F3F5, panels/tables white, buttons #FCFCFC
