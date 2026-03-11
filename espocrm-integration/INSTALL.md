# PropertyPipeline Refurb Projects - EspoCRM Integration

## Overview

This integration adds:
1. A **RefurbProject** custom entity to your EspoCRM instance for storing refurbishment project data
2. A **"Refurb Projects" button** on Opportunity and Lead detail views that opens the Refurb Projects UI in a new tab
3. Seamless authentication — the user's existing EspoCRM session is passed to the app automatically

All refurb project data is stored in the user's own EspoCRM database. The centrally hosted app has no database of its own — it proxies all operations to the user's EspoCRM instance.

## How It Works

1. User opens an Opportunity or Lead record in PropertyPipeline CRM
2. Clicks the "Refurb Projects" button in the detail view toolbar
3. A new tab opens with the Refurb Projects app, passing:
   - **Auth token** (from the user's existing CRM session, via URL hash fragment)
   - **Entity context** (type, ID, name of the CRM record)
   - **CRM URL** (so the app can make API calls back to the CRM)
4. The app reads/writes RefurbProject records directly in the user's CRM via the EspoCRM REST API
5. A "Back to CRM" button appears in the header to return to the entity record

## Prerequisites

- EspoCRM 7.x or later (PropertyPipeline)
- Admin access to the EspoCRM instance
- The centrally hosted Refurb Projects app URL

## Installation Steps

### Step 1: Configure the App URL

Before installing, replace `{{REFURB_APP_URL}}` in the button handler file with your deployed Refurb Projects URL:

**File to update:**
- `client/custom/src/refurb-handler.js`

Replace:
```js
var REFURB_APP_URL = '{{REFURB_APP_URL}}';
```

With your actual deployed URL, e.g.:
```js
var REFURB_APP_URL = 'https://your-refurb-app.replit.app';
```

### Step 2: Copy All Files to EspoCRM

Copy the contents of this directory into your EspoCRM instance root:

```bash
# From the espocrm-integration directory
cp -r custom/ /path/to/espocrm/
cp -r client/ /path/to/espocrm/
```

This installs:

**RefurbProject entity (safe to overwrite):**
- `custom/Espo/Custom/Controllers/RefurbProject.php` - API controller (required for REST API access)
- `custom/Espo/Custom/Entities/RefurbProject.php` - Entity class
- `custom/Espo/Custom/Api/RefurbAuth.php` - Auth secret endpoint
- `custom/Espo/Custom/Resources/metadata/entityDefs/RefurbProject.json` - Field and link definitions
- `custom/Espo/Custom/Resources/metadata/scopes/RefurbProject.json` - Entity scope config
- `custom/Espo/Custom/Resources/metadata/clientDefs/RefurbProject.json` - Frontend config
- `custom/Espo/Custom/Resources/metadata/layouts/RefurbProject/list.json` - Full list layout
- `custom/Espo/Custom/Resources/metadata/layouts/RefurbProject/listSmall.json` - Compact list for bottom panels
- `custom/Espo/Custom/Resources/metadata/layouts/RefurbProject/detail.json` - Detail layout
- `custom/Espo/Custom/Resources/i18n/en_US/RefurbProject.json` - Field and link translations

**Shared files (must be MERGED, not overwritten):**
- `custom/Espo/Custom/Resources/metadata/entityDefs/Lead.json` - Adds hasMany refurbProjects link
- `custom/Espo/Custom/Resources/metadata/entityDefs/Opportunity.json` - Adds hasMany refurbProjects link
- `custom/Espo/Custom/Resources/metadata/clientDefs/Lead.json` - Adds Refurb Projects bottom panel
- `custom/Espo/Custom/Resources/metadata/clientDefs/Opportunity.json` - Adds Refurb Projects bottom panel
- `custom/Espo/Custom/Resources/metadata/clientDefs/Global.json` - Adds button to detail views
- `custom/Espo/Custom/Resources/i18n/en_US/Lead.json` - Adds refurbProjects link label
- `custom/Espo/Custom/Resources/i18n/en_US/Opportunity.json` - Adds refurbProjects link label
- `custom/Espo/Custom/Resources/i18n/en_US/Global.json` - Scope name translations
- `custom/Espo/Custom/Resources/routes.json` - Adds RefurbAuth API route

**Button handler:**
- `client/custom/src/refurb-handler.js` - Button action handler with visibility check

### Step 3: Clear Cache & Rebuild

After copying the files, clear EspoCRM's cache and rebuild:

```bash
# Via CLI
php clear_cache.php
php rebuild.php

# Or via Admin UI
# Administration > Clear Cache
# Administration > Rebuild
```

This will:
- Create the `refurb_project` database table automatically
- Register the RefurbProject entity in the system
- Add the buttons to Opportunity and Lead detail views

### Step 4: Configure Roles & Permissions

1. Go to **Administration > Roles**
2. Edit the roles that should have access to Refurb Projects
3. Set appropriate permissions (Read, Create, Edit, Delete) for the RefurbProject scope

### Step 5: Verify

1. Navigate to any Opportunity record's detail view
2. You should see a "Refurb Projects" button in the toolbar
3. Click it — a new tab should open with the Refurb Projects app
4. The associated entity fields should be pre-populated
5. Create a test project and verify it appears in EspoCRM under the RefurbProject entity

## CORS Configuration

Since the Refurb Projects app is centrally hosted on a different domain, you may need to configure CORS on your EspoCRM instance. However, since the app proxies API calls through its own backend (not making direct browser-to-CRM requests), CORS should not be required.

## Adding More Entity Types

To add the button to other entity types (e.g., Contact, Account):

1. Edit `client/custom/src/refurb-handler.js` and add the entity type to the `isVisible()` method's array
2. Clear cache and rebuild

## URL Parameters

The app accepts these URL parameters:

| Parameter    | Description                           | Example                          |
|-------------|---------------------------------------|----------------------------------|
| entityType  | The CRM entity type                   | Opportunity, Lead                |
| entityId    | The CRM record ID                     | 5f8a3b2c1d4e5f6a               |
| entityName  | The record's display name             | 14 Victoria Road                 |
| espoUrl     | The base URL of the CRM instance      | https://crm.propertypipeline.com |

Auth credentials are passed via the URL hash fragment (not logged or sent to servers) and cleared from the URL immediately after the app reads them.

## Merging with Existing Files

Several files in this integration may already exist in your EspoCRM instance with other customisations. **These must be merged, not overwritten:**

- `metadata/entityDefs/Lead.json` — merge the `links` object
- `metadata/entityDefs/Opportunity.json` — merge the `links` object
- `metadata/clientDefs/Lead.json` — merge the `bottomPanels` object
- `metadata/clientDefs/Opportunity.json` — merge the `bottomPanels` object
- `metadata/clientDefs/Global.json` — merge the `menu.detail.buttons` array
- `i18n/en_US/Lead.json` — merge the `links` object
- `i18n/en_US/Opportunity.json` — merge the `links` object
- `i18n/en_US/Global.json` — merge the `scopeNames` and `scopeNamesPlural` objects
- `Resources/routes.json` — append new route entries to the existing array

The Ansible playbook handles this automatically using the merge scripts in `scripts/`. If installing manually, deep-merge these files rather than replacing them.

## RefurbProject Entity Fields

| Field               | Type    | Description                              |
|--------------------|---------|------------------------------------------|
| name               | varchar | Project name (required)                  |
| status             | enum    | Draft, Approved, In Progress, Completed, Cancelled |
| description        | text    | Project description                      |
| currency           | varchar | GBP, EUR, USD                           |
| associatedEntityType | varchar | Entity type (Opportunity, Lead, etc.)  |
| associatedEntityId | varchar | EspoCRM entity record ID                |
| associatedEntityName | varchar | Entity display name                    |
| lineItems          | text    | JSON string containing line item array   |
| subtotal           | float   | Sum of all line item net totals          |
| vatTotal           | float   | Sum of all line item VAT amounts         |
| grandTotal         | float   | subtotal + vatTotal                      |
| notes              | text    | Additional notes                         |

## Troubleshooting

- **Button not appearing?** Clear EspoCRM cache and rebuild. Check browser console for JS errors.
- **"CRM Connection Required" screen?** The auth token wasn't passed. Ensure the button handler JS files have the correct app URL and that cookies are accessible.
- **403 Forbidden errors?** Check that the user's role has permissions for the RefurbProject scope.
- **Entity not visible?** Ensure the scope has `tab: true` and the user's role allows access. You may need to add the RefurbProject tab via Administration > User Interface > Tab List.
- **Wrong URL opening?** Verify the `REFURB_APP_URL` constant in the JS files.
