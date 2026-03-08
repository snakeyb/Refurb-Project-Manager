# PropertyPipeline Refurb Projects - EspoCRM Integration

## Overview

This integration adds a "Refurb Projects" button to **Property** and **Lead** detail views in EspoCRM (PropertyPipeline). When clicked, it opens the Refurb Projects module in a new browser tab, passing the entity context (type, ID, name) so the module knows which CRM record is associated.

## How It Works

1. User opens a Property or Lead record in PropertyPipeline CRM
2. Clicks the "Refurb Projects" button in the detail view toolbar
3. A new tab opens with the Refurb Projects app, pre-filling:
   - **Entity Type** (Property or Lead)
   - **Entity ID** (the CRM record ID)
   - **Entity Name** (the record name)
   - **CRM URL** (so the app can link back to the CRM record)
4. When creating a new project, these fields are automatically populated
5. A "Back to CRM" button appears in the header to return to the entity record

## Installation Steps

### 1. Configure the App URL

Before installing, replace `{{REFURB_APP_URL}}` in both JS files with your deployed Refurb Projects URL:

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

### 2. Copy Files to EspoCRM

Copy the contents of this directory into your EspoCRM instance root:

```bash
# From the espocrm-integration directory
cp -r custom/ /path/to/espocrm/
cp -r client/ /path/to/espocrm/
```

This places:
- `custom/Espo/Custom/Resources/metadata/clientDefs/Property.json` - Button metadata for Property
- `custom/Espo/Custom/Resources/metadata/clientDefs/Lead.json` - Button metadata for Lead
- `client/custom/src/views/property/refurb-button.js` - Button handler for Property
- `client/custom/src/views/lead/refurb-button.js` - Button handler for Lead

### 3. Clear Cache & Rebuild

After copying the files, clear EspoCRM's cache:

```bash
# Via CLI
php clear_cache.php
php rebuild.php

# Or via Admin UI
# Administration > Clear Cache
# Administration > Rebuild
```

### 4. Verify

1. Navigate to any Property record's detail view
2. You should see a "Refurb Projects" button in the toolbar
3. Click it - a new tab should open with the Refurb Projects app
4. The associated entity fields should be pre-populated

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

## Merging with Existing clientDefs

If your Property or Lead entity already has a custom `clientDefs` JSON file, you'll need to merge the button configuration manually rather than replacing the file. Add the `refurbProjects` entry into the existing `menu.detail.buttons` object.

## Troubleshooting

- **Button not appearing?** Clear EspoCRM cache and rebuild. Check browser console for JS errors.
- **Wrong URL opening?** Verify the `REFURB_APP_URL` constant in the JS files.
- **Entity fields not pre-filling?** Check the URL parameters in the browser address bar after clicking the button.
