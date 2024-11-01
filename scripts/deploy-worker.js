const dotenv = require("dotenv");

const fs = require('fs');
const path = require('path');

const child_process = require('child_process');

const { getEnv } = require('@uniformdev/common');

const WRANGLER_COMMAND = 'wrangler publish';

const WORKER_DIR_NAME = 'cloudflare-worker';
const WORKER_SOURCE_DIR = getWorkerSourceDir(WORKER_DIR_NAME);

const APP_ROOT = process.cwd();
const WORKER_TEMP_DIR = path.join(APP_ROOT, '.temp/.wrangler');
const WRANGLER_CONFIG_PATH = path.join(WORKER_TEMP_DIR, 'wrangler.toml');

dotenv.config({
    path: path.join(APP_ROOT, '.env')
});

const accountId = getEnv(process.env, 'CF_ACCOUNT_ID', '');
if (!accountId) {
    throw new Error('CF_ACCOUNT_ID is NOT defined.');
}

const apiToken = getEnv(process.env, 'CF_API_TOKEN', '');
if (!apiToken) {
    throw new Error('CF_API_TOKEN is NOT defined.');
}

const workerName = getEnv(process.env, 'CF_WORKER_NAME', '');
if (!workerName) {
    throw new Error('CF_WORKER_NAME is NOT defined.');
}

const zoneId = getEnv(process.env, 'CF_ZONE_ID', '');
if (!zoneId) {
    throw new Error('CF_ZONE_ID is NOT defined.');
}

const workerRoute = getEnv(process.env, 'CF_WORKER_ROUTE', '');
if (!workerRoute) {
    throw new Error('CF_WORKER_ROUTE is NOT defined. Example: custom.domain.com/*');
}

console.log('Deploying Cloudflare worker');
console.log('  APP_ROOT: ' + APP_ROOT);
console.log('  WORKER_SOURCE_DIR: ' + WORKER_SOURCE_DIR);

console.log('Coping worker files...');

ensureCleanDir(WORKER_TEMP_DIR);

copyRecursiveSync(WORKER_SOURCE_DIR, WORKER_TEMP_DIR);

rewriteWranglerConfig(WRANGLER_CONFIG_PATH, {
    accountId: accountId,
    workerName: workerName,
    zoneId: zoneId,
    workerRoute: workerRoute
});

console.log('Exec: ' + WRANGLER_COMMAND);

child_process.execSync(WRANGLER_COMMAND, {
    cwd: WORKER_TEMP_DIR,
    maxBuffer: 20 * 1024 * 1024,
    env: {
        ...process.env,
        CF_API_TOKEN: apiToken,
    },
});

function getWorkerSourceDir(name) {
    const localPath = path.join(__dirname, name);
    if (fs.existsSync(localPath)) {
        return localPath;
    }

    const appPath = path.join(process.cwd(), name);
    if (fs.existsSync(appPath)) {
        return appPath;
    }

    throw new Error('Could not find Cloudflare worker directory: '+ name);
}

function ensureCleanDir(dirPath) {
    if (fs.existsSync(dirPath)) {
        fs.rmdirSync(dirPath, { recursive: true });
    }
    fs.mkdirSync(dirPath, {recursive: true});
}

function rewriteWranglerConfig(configPath, options) {
    if (!fs.existsSync(configPath)) {
        throw new Error(`Wrangler config does not exist: ${configPath}`);
    }

    const rawContent = fs.readFileSync(configPath, { encoding: 'utf8' });

    const content = rawContent
        .replace('__ACCOUNT_ID__', options.accountId)
        .replace('__WORKER_NAME__', options.workerName)
        .replace('__ZONE_ID__', options.zoneId)
        .replace('__WORKER_ROUTE__', options.workerRoute)
        
    fs.writeFileSync(configPath, content, { encoding: 'utf8' });
}

function copyRecursiveSync(source, dest) {
    var exists = fs.existsSync(source);
    if (!exists) {
        return;
    }
    var isDirectory = fs.lstatSync(source).isDirectory();
    if (isDirectory) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }

        fs.readdirSync(source).forEach((child) => {
            const childSource = path.join(source, child);
            const childDest = path.join(dest, child);

            copyRecursiveSync(childSource, childDest);
        });
    } else {
        fs.copyFileSync(source, dest);
    }
}