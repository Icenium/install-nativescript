const { sysInfo } = require("nativescript-doctor");

module.exports = ({ logMessage, execSync, sudoExec, stringFormat }) => {
    const getNativeScriptCliVersion = () => {
        return sysInfo.getNativeScriptCliVersion()
            .then((cliVersion) => {
                logMessage(`NS CLI version detected: ${cliVersion}`);

                return cliVersion;
            });
    };

    const getDependencyPath = ({ getCLICommand }) => {
        let cliPath = "";

        try {
            cliPath = execSync(getCLICommand);

            logMessage(`NS CLI found at location: ${cliPath}`);
        } catch (error) {
            logMessage(`NS CLI not found. Error:\n${error}`);
        }

        return cliPath.toString();
    };

    const installCLI = ({ installCLICommand }, cliVersion) => {
        const version = cliVersion ? `@${cliVersion}` : "";
        const command = stringFormat(installCLICommand, version);

        return sudoExec(command);
    };

    const uninstallCLI = ({ removeGlobalPackageCommand }) => {
        const removeCLICommand = stringFormat(removeGlobalPackageCommand, "nativescript");

        return sudoExec(removeCLICommand);
    };

    const findCLI = (config) => {
        const cliPath = getDependencyPath(config);

        if (!cliPath) {
            return Promise.reject("CLI not found");
        }

        return getNativeScriptCliVersion()
            .catch(() => {
                return uninstallCLI(config)
                    .then(() => Promise.reject("CLI not found"));
            })
            .then((cliVersion) => {
                if (cliVersion) {
                    return Promise.resolve(cliPath);
                } else {
                    return uninstallCLI(config)
                        .then(() => Promise.reject("CLI not found"));
                }
            });
    };

    const ensureCLI = (config, cliVersion) => {
        return findCLI(config)
            .catch(() => {
                return installCLI(config, cliVersion)
                    .then(findCLI.bind(null, config));
            });
    };

    return {
        ensureCLI
    };
};
