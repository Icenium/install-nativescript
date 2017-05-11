const helpers = require("./lib/helpers");
const ensureNodeServiceGenerator = require("./lib/ensure-node-service");
const ensureCLIServiceGenerator = require("./lib/ensure-cli-service");

const ensureNodeService = ensureNodeServiceGenerator(helpers);
const ensureCLIService = ensureCLIServiceGenerator(helpers);
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

const ensureNativeScript = () => {
    return ensureNodeService.ensureNode(platformConfig)
        .then(ensureCLIService.ensureCLI.bind(null, platformConfig));
};

module.exports = {
    ensureNativeScript
};
