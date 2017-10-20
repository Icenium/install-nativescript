const temp = require("temp");
const { sysInfo } = require("nativescript-doctor");
const environmentServiceGenerator = require("./environment-service");

module.exports = (helpers, config) => {
    const environmentService = environmentServiceGenerator(helpers, config);

    const { logMessage, execSync, sudoExec, downloadFile, stringFormat } = helpers;
    const { getNodeCommand, nodeDownloadAddress, nodeInstallerSuffix, installCommand, removeGlobalPackageCommand } = config;

    const getNodeVersion = () => {
        return sysInfo.getNodeVersion()
            .then((nodeVersion) => {
                logMessage(`Node version detected: ${nodeVersion}`);

                return nodeVersion;
            });
    };

    const getDependencyPath = () => {
        let nodePath = "";

        try {
            nodePath = execSync(getNodeCommand);

            logMessage(`Node found at location: ${nodePath}`);
        } catch (error) {
            logMessage(`Node not found. Error:\n${error}`);
        }

        return nodePath.toString();
    };

    const downloadNodeInstaller = (nodeVersion) => {
        const address = stringFormat(nodeDownloadAddress, nodeVersion);

        return downloadFile(address, nodeInstallerSuffix);
    };

    const removeNPMFromNodeModules = () => {
        const removeNPMCommand = stringFormat(removeGlobalPackageCommand, "npm");

        return sudoExec(removeNPMCommand);
    };

    const installNode = (nodeVersion) => {
        temp.track();

        return environmentService.init()
            .then(() => nodeVersion)
            .then(downloadNodeInstaller)
            .then(pathToExecutable => stringFormat(installCommand, pathToExecutable))
            .then(sudoExec)
            .then(temp.cleanupSync.bind(temp))
            .catch(error => {
                temp.cleanupSync();

                return Promise.reject(error);
            })
            .then(removeNPMFromNodeModules)
            .then(environmentService.updatePath);
    };

    const findNode = () => {
        const nodePath = getDependencyPath();

        if (!nodePath) {
            return Promise.reject("Node not found");
        }

        return getNodeVersion()
            .then((nodeVersion) => {
                if (nodeVersion) {
                    return Promise.resolve(nodePath);
                }

                return Promise.reject("TNS doctor does not detect the version of the installed node.");
            });
    };

    const ensureNode = (nodeVersion = "6.11.4") => {
        return findNode()
            .catch(() => {
                return installNode()
                    .then(findNode);
            });
    };

    return {
        ensureNode
    };
};
