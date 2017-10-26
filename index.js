const { platform } = process;

let platformConfig;

switch (platform) {
    case "darwin":
        platformConfig = require("./lib/mac");
        break;
    case "win32":
        platformConfig = require("./lib/windows");
        break;
    default:
        throw new Error(`Unsupported platform: ${platform}`);
}

const { sysInfo, setShouldCacheSysInfo } = require("nativescript-doctor");

setShouldCacheSysInfo(false);

const helpers = require("./lib/helpers");
const ensureNodeServiceGenerator = require("./lib/ensure-node-service");
const ensureCLIServiceGenerator = require("./lib/ensure-cli-service");
const permissionsServiceGenerator = require("./lib/permissions-service");

const ensureNodeService = ensureNodeServiceGenerator(helpers, platformConfig, sysInfo);
const ensureCLIService = ensureCLIServiceGenerator(helpers, platformConfig, sysInfo);
const permissionsService = permissionsServiceGenerator(helpers, platformConfig);

module.exports = {
    ensureNode: ensureNodeService.ensureNode.bind(ensureNodeService),
    ensureCLI: ensureCLIService.ensureCLI.bind(ensureCLIService),
    getNPMFoldersWithMissingPermissions: permissionsService.getNPMFoldersWithMissingPermissions.bind(permissionsService),
    fixMissingNPMPermissions: permissionsService.fixMissingNPMPermissions.bind(permissionsService)
};
