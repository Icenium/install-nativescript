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
        const cliPath = getDependencyPath();

        if (cliPath) {
            return;
        }

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
