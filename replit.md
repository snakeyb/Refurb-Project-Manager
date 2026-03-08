# PropertyPipeline - Refurb Projects Module

## Overview
A refurbishment project pricing module designed for PropertyPipeline CRM (EspoCRM-based SaaS). Allows users to create, manage, and price refurbishment projects with line items, VAT calculations, and entity associations.

## Architecture
- **Frontend**: React SPA with EspoCRM-inspired UI (no sidebar, clean panel-based layout)
- **Backend**: Express.js API with PostgreSQL storage
- **Database**: PostgreSQL via Drizzle ORM
- **Styling**: Tailwind CSS with Open Sans font, EspoCRM color palette

## Key Features
- Refurb project CRUD with list view, detail view, create/edit forms
- Dynamic line items with description, quantity, unit cost, VAT rate
- Automatic calculations: net total, VAT amount, grand total per line and overall
- Multiple VAT rates: 0% (exempt), 5% (reduced), 20% (standard)
- Associate projects with Property, Lead, Contact, or Account entities
- Status workflow: Draft, Approved, In Progress, Completed, Cancelled
- Project duplication
- GBP/EUR/USD currency support

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
- `client/src/pages/project-list.tsx` - List view
- `client/src/pages/project-detail.tsx` - Detail view
- `client/src/pages/project-form.tsx` - Create/edit form
- `client/src/components/espo-header.tsx` - Breadcrumb header
- `client/src/components/espo-panel.tsx` - Collapsible panel
- `client/src/components/line-item-table.tsx` - Line items table (readonly + editable)
- `client/src/components/status-badge.tsx` - Status badge component
- `client/src/lib/calculations.ts` - Line item & totals calculations
- `client/src/lib/format.ts` - Currency & date formatting

## API Endpoints
- `GET /api/refurb-projects` - List all projects
- `GET /api/refurb-projects/:id` - Get project by ID
- `POST /api/refurb-projects` - Create project
- `PATCH /api/refurb-projects/:id` - Update project
- `DELETE /api/refurb-projects/:id` - Delete project

## Design Notes
- Designed to be embeddable within EspoCRM via iframe or opened in new tab
- Panel-based layout matching EspoCRM's native detail/edit views
- Uses collapsible panels, breadcrumb navigation, and CRM-style field layouts
- No sidebar - standalone pages accessible via URL
