const _ = require("lodash");
const semver = require("semver");

module.exports = (helpers, config, sysInfo) => {
    const { logMessage, execSync, stringFormat } = helpers;
    const { getCLICommand, installCLICommand, removeGlobalPackageCommand } = config;

    const getNativeScriptCliVersion = () => {
        return sysInfo.getNativeScriptCliVersion()
            .then((cliVersion) => {
                logMessage(`NS CLI version detected: ${cliVersion}`);

                return cliVersion;
            });
    };

    const getDependencyPath = () => {
        let cliPath = "";

        try {
            cliPath = execSync(getCLICommand);

            logMessage(`NS CLI found at location: ${cliPath}`);
        } catch (error) {
            logMessage(`NS CLI not found. Error:\n${error}`);
        }

        return cliPath;
    };

    const installCLI = (cliVersion) => {
        const version = cliVersion ? `@${cliVersion}` : "";
        const command = stringFormat(installCLICommand, version);

        try {
            execSync(command);

            logMessage("Successfully installed NS CLI.");
        } catch (error) {
            logMessage(`Failed to install NS CLI: ${error}`);

            throw error;
        }
    };

    const uninstallCLI = () => {
        const cliPath = getDependencyPath();

        if (!cliPath) {
            return;
        }

        const removeCLICommand = stringFormat(removeGlobalPackageCommand, "nativescript");

        try {
            execSync(removeCLICommand);

            logMessage("Successfully uninstalled NS CLI.");
        } catch (error) {
            logMessage(`Failed to uninstalled NS CLI: ${error}`);

            throw error;
        }
    };

    const findCLI = (minVersion) => {
        return getNativeScriptCliVersion()
            .then((cliVersion) => {
                if (cliVersion) {
                    return Promise.resolve(cliVersion);
                }

                return Promise.reject("TNS doctor does not detect the version of NS CLI.");
            })
            .catch((error) => {
                logMessage(`NS CLI not found. Error:\n${error}`);

                uninstallCLI();

                return Promise.reject(error);
            })
            .then((cliVersion) => {
                const hasMinRequirement = !_.isNil(minVersion) && !_.isNull(semver.valid(minVersion));

                if (!hasMinRequirement || semver.gte(cliVersion, minVersion)) {
                    return Promise.resolve(cliVersion);
                }

                const errorMessage = `Found version ${cliVersion} does not satisfy required minVersion ${minVersion}.`;
                const error = new Error(errorMessage);

                error.ignoreInstallation = true;

                logMessage(errorMessage);

                return Promise.reject(error);
            });
    };

    const ensureCLI = ({ version = "latest", minVersion } = {}) => {
        return findCLI(minVersion)
            .catch((error) => {
                if (!error || !error.ignoreInstallation) {
                    const cliPath = getDependencyPath();

                    if (cliPath) {
                        return Promise.reject(error);
                    }
                }

                installCLI(version);

                return findCLI(minVersion);
            });
    };

    return {
        ensureCLI
    };
};
