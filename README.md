# Uniform Optimize starter kit for Sitecore JSS React

This repo contains both the starter kit with content items and required configuration files.

This kit is pre-wired for edge-side rendering for Sitecore JSS and is created to fast track the activation of Uniform Optimize capability added to your Sitecore JSS solution.

You can also use this kit to start a vanilla project, simply remove everything from `/src/components` and adjust the Sitecore site name from `uniform-jss-kit` to whatever you want and get cracking.

## Official docs
1. [Uniform Optimize for Sitecore docs](https://docs.uniform.dev/sitecore/optimize)

## Pre-requisites
1. Node.js v16.17 (LTS) is installed
1. Sitecore 9.3+ instance available with Sitecore JSS installed and configured.
1. "Uniform for Sitecore v5" installed and configured on your Sitecore instance. Check out [these docs](https://60da7ad12ba84d00071cd844--uniform-docs.netlify.app/sitecore/optimize/getting-started) for more info.
1. Install the Sitecore package with the starter kit items from `/sitecore/App_Data/packages` folder (optional).
1. Create Sitecore API key as per Sitecore JSS documentation [here](https://jss.sitecore.net/docs/client-frameworks/getting-started/app-deployment).

## Getting started
1. Make sure to install and configure Uniform for Sitecore connector on your Sitecore instance.
1. Add `NPM_TOKEN` environment variable with the value we provided you with.
1. `npm install --legacy-peer-deps`
1. `jss setup` and follow the steps Sitecore JSS requires and use the API key you created during the Pre-requisites step above.
1. `jss deploy config` to deploy the application config from `/sitecore/config` folder into your Sitecore instance.
1. `npm run build` to build the app.
1. `npm start` to start the app in connected mode.

## Cloudflare worker setup
1. Install `@cloudflare/wrangler` npm package \
    `npm i @cloudflare/wrangler@1.19.2 -g` 
1. Create a Cloudflare account: https://dash.cloudflare.com/login 
1. Create a Cloudflare API token:
    * Follow the link: https://dash.cloudflare.com/profile/api-tokens
    * Select "Create Token" button
    * Select "Edit Cloudflare Workers" among API token templates
    * In a new "Create Token" window don't change any Permissions (they are predefined correctly); indicate "All Accounts" in Account Resources section and "All Zones" in Zone Resources section. Client IP Address Filtering section can be skipped.
    * add `| Zone | Cache Purge | Purge |` permission
    * Press "Continue To Summary" and then "Create Token" buttons.
    * **IMPORTANT!** Copy and save your API Token somewhere. It only shown once after the initial setup. 
    * Finalize the worker setup: navigate to the Workers page (Click Workers link on the right pane on the Cloudflare main page) and click the Setup button next to your worker name; Choose to proceed with free account on the next page


### Deploy worker

1. Ensure you have Cloudflare site.

1. Add environment variables to `.env` file:
    * `CF_ACCOUNT_ID` - Cloudflare account ID
    * `CF_API_TOKEN` - Cloudflare API token
    * `CF_ZONE_ID` - Zone ID of the Cloudflare site
    * `CF_WORKER_NAME` - Preferable worker name
    * `CF_WORKER_ROUTE` - Worker routes pattern \
    Template: `<CLOUDFLARE_SITE_DOMAIN>/*` \
    Example: `custom.site.com/*`

1. `npm run cloudflare:deploy-worker`

1. Ensure worker has been deployed and assigned to defined url

### Configure Cloudflare Page Rules

1. Go to `Rules` tab (https://dash.cloudflare.com/{account-id}/{cloudflare-site-name}/rules)
1. Add new page rule with the next variables for `<CLOUDFLARE_SITE_DOMAIN>/*` url pattern:
    * `SSL` = Full
    * `Cache Level` = Cache Everything
    * `Edge Cache TTL` = 2 hours

### Cache Purge

Cleanup Cloudflare cache after Sitecore publish

1. Make sure provided API Token has permission to purge cache otherwise you'll be getting the `Authentication failed` error on cache purge requests: \
    Go to https://dash.cloudflare.com/profile > switch to the 'API Tokens' tab > call menu for your token (click '...' next to it) and choose 'Edit'. In Permissions section make sure you have following permission:
    `| Zone | Cache Purge | Purge |`

1. Enable config: `esi-jss.Uniform.PurgeCache.Cloudflare.config.disabled` and update `purgeService` variables:
    * update `apiToken` with created Cloudflare API token
    * update `zoneId` with Zone ID of the Cloudflare site
    * update `hostNames` with public url of the Cloudflare site


**Note:** Remove or update the `robots.txt` if you going to use this kit in production
