const { sysInfo } = require("nativescript-doctor");

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
        const version = cliVersion ? `@${cliVersion}` : "";
        const command = stringFormat(installCLICommand, version);

        execSync(command);
    };

    const uninstallCLI = () => {
        const removeCLICommand = stringFormat(removeGlobalPackageCommand, "nativescript");

        execSync(removeCLICommand);
    };

    const findCLI = () => {
        const cliPath = getDependencyPath();

        if (!cliPath) {
            return Promise.reject("CLI not found");
        }

        return getNativeScriptCliVersion()
            .then((cliVersion) => {
                if (cliVersion) {
                    return Promise.resolve(cliPath);
                }

                return Promise.reject("TNS doctor does not detect the version of the installed CLI.");
            })
            .catch((error) => {
                logMessage(`CLI was incorrectly installed. Error:\n${error}`);

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
