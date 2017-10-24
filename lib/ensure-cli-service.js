const { sysInfo, setShouldCacheSysInfo } = require("nativescript-doctor");

setShouldCacheSysInfo(false);

module.exports = (helpers, config) => {
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

        return cliPath.toString();
    };

    const installCLI = (cliVersion) => {
        const cliPath = getDependencyPath();

        if (cliPath) {
            return;
        }

        const version = cliVersion ? `@${cliVersion}` : "";
        const command = stringFormat(installCLICommand, version);

        execSync(command);
    };

    const uninstallCLI = () => {
        const cliPath = getDependencyPath();

        if (!cliPath) {
            return;
        }

        const removeCLICommand = stringFormat(removeGlobalPackageCommand, "nativescript");

        execSync(removeCLICommand);
    };

    const findCLI = () => {
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
            });
    };

    const ensureCLI = (cliVersion) => {
        return findCLI()
            .catch(() => {
                installCLI(cliVersion);

                return findCLI();
            });
    };

    return {
        ensureCLI
    };
};
