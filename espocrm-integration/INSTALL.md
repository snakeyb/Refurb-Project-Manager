# PropertyPipeline Refurb Projects - EspoCRM Integration

## Overview

This integration adds:
1. A **RefurbProject** custom entity to your EspoCRM instance for storing refurbishment project data
2. A **"Refurb Projects" button** on Property and Lead detail views that opens the Refurb Projects UI in a new tab
3. Seamless authentication — the user's existing EspoCRM session is passed to the app automatically

All refurb project data is stored in the user's own EspoCRM database. The centrally hosted app has no database of its own — it proxies all operations to the user's EspoCRM instance.

## How It Works

1. User opens a Property or Lead record in PropertyPipeline CRM
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

Before installing, replace `{{REFURB_APP_URL}}` in both JS button handler files with your deployed Refurb Projects URL:

**Files to update:**
- `client/custom/src/views/property/refurb-button.js`
- `client/custom/src/views/lead/refurb-button.js`

Replace:
```js
const REFURB_APP_URL = '{{REFURB_APP_URL}}';
```

With your actual deployed URL, e.g.:
```js
const REFURB_APP_URL = 'https://your-refurb-app.replit.app';
```

### Step 2: Copy All Files to EspoCRM

Copy the contents of this directory into your EspoCRM instance root:

```bash
# From the espocrm-integration directory
cp -r custom/ /path/to/espocrm/
cp -r client/ /path/to/espocrm/
```

This installs:

**Custom Entity (RefurbProject):**
- `custom/Espo/Custom/Resources/metadata/entityDefs/RefurbProject.json` - Field definitions
- `custom/Espo/Custom/Resources/metadata/scopes/RefurbProject.json` - Entity scope config
- `custom/Espo/Custom/Resources/metadata/clientDefs/RefurbProject.json` - Frontend config
- `custom/Espo/Custom/Resources/metadata/layouts/RefurbProject/list.json` - List layout
- `custom/Espo/Custom/Resources/metadata/layouts/RefurbProject/detail.json` - Detail layout
- `custom/Espo/Custom/Resources/i18n/en_US/RefurbProject.json` - Field translations
- `custom/Espo/Custom/Resources/i18n/en_US/Global.json` - Scope name translations

**Button Handlers:**
- `custom/Espo/Custom/Resources/metadata/clientDefs/Property.json` - Button metadata for Property
- `custom/Espo/Custom/Resources/metadata/clientDefs/Lead.json` - Button metadata for Lead
- `client/custom/src/views/property/refurb-button.js` - Button handler for Property
- `client/custom/src/views/lead/refurb-button.js` - Button handler for Lead

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
- Add the buttons to Property and Lead detail views

### Step 4: Configure Roles & Permissions

1. Go to **Administration > Roles**
2. Edit the roles that should have access to Refurb Projects
3. Set appropriate permissions (Read, Create, Edit, Delete) for the RefurbProject scope

### Step 5: Verify

1. Navigate to any Property record's detail view
2. You should see a "Refurb Projects" button in the toolbar
3. Click it — a new tab should open with the Refurb Projects app
4. The associated entity fields should be pre-populated
5. Create a test project and verify it appears in EspoCRM under the RefurbProject entity

## CORS Configuration

Since the Refurb Projects app is centrally hosted on a different domain, you may need to configure CORS on your EspoCRM instance. However, since the app proxies API calls through its own backend (not making direct browser-to-CRM requests), CORS should not be required.

## Adding More Entity Types

To add the button to other entity types (e.g., Contact, Account):

1. Create a new metadata JSON file:
   `custom/Espo/Custom/Resources/metadata/clientDefs/{EntityType}.json`

2. Create a new button handler:
   `client/custom/src/views/{entitytype}/refurb-button.js`

3. Follow the same pattern as the Property/Lead examples

## URL Parameters

The app accepts these URL parameters:

| Parameter    | Description                           | Example                          |
|-------------|---------------------------------------|----------------------------------|
| entityType  | The CRM entity type                   | Property, Lead                   |
| entityId    | The CRM record ID                     | 5f8a3b2c1d4e5f6a               |
| entityName  | The record's display name             | 14 Victoria Road                 |
| espoUrl     | The base URL of the CRM instance      | https://crm.propertypipeline.com |

Auth credentials are passed via the URL hash fragment (not logged or sent to servers) and cleared from the URL immediately after the app reads them.

## Merging with Existing clientDefs

If your Property or Lead entity already has a custom `clientDefs` JSON file, you'll need to merge the button configuration manually rather than replacing the file. Add the `refurbProjects` entry into the existing `menu.detail.buttons` object.

## Merging with Existing Global.json

If you already have a custom `i18n/en_US/Global.json`, merge the `scopeNames` and `scopeNamesPlural` entries rather than replacing the file.

## RefurbProject Entity Fields

| Field               | Type    | Description                              |
|--------------------|---------|------------------------------------------|
| name               | varchar | Project name (required)                  |
| status             | enum    | Draft, Approved, In Progress, Completed, Cancelled |
| description        | text    | Project description                      |
| currency           | varchar | GBP, EUR, USD                           |
| associatedEntityType | varchar | Entity type (Property, Lead, etc.)     |
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
