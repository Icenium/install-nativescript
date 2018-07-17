const temp = require("temp");
const environmentServiceGenerator = require("./environment-service");

module.exports = (helpers, config, sysInfo) => {
    const environmentService = environmentServiceGenerator(helpers, config);

    const { logMessage, execSync, sudoExec, downloadFile, stringFormat } = helpers;
    const { getNodeCommand, getNPMCommand, nodeDownloadAddress, nodeInstallerSuffix, installCommand } = config;

    const getNodeVersion = () => {
        return sysInfo.getNodeVersion()
            .then((nodeVersion) => {
                logMessage(`Node version detected: ${nodeVersion}`);

                return nodeVersion;
            });
    };

    const getDependencyPath = (getDependencyCommand) => {
        let dependencyPath = "";

        try {
            dependencyPath = execSync(getDependencyCommand);

            logMessage(`Dependency found at location: ${dependencyPath}`);
        } catch (error) {
            logMessage(`Dependency not installed. Error:\n${error}`);
        }

        return dependencyPath;
    };

    const downloadNodeInstaller = (nodeVersion) => {
        const address = stringFormat(nodeDownloadAddress, nodeVersion);

        return downloadFile(address, nodeInstallerSuffix);
    };

    const installNode = (nodeVersion) => {
        const nodePath = getDependencyPath(getNodeCommand);

        if (nodePath) {
            return Promise.reject("Node already installed.");
        }

        getDependencyPath(getNPMCommand);

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
            .then(environmentService.updateENV);
    };

    const findNode = () => {
        return getNodeVersion()
            .then((nodeVersion) => {
                if (nodeVersion) {
                    return Promise.resolve(nodeVersion);
                }

                return Promise.reject("TNS doctor does not detect the version of node.");
            })
            .catch((error) => {
                logMessage(`Node not found. Error:\n${error}`);

                return Promise.reject(error);
            });
    };

    const ensureNode = ({ version = "8.11.3" } = {}) => {
        return findNode()
            .catch(() => {
                return installNode(version)
                    .then(findNode);
            });
    };

    return {
        ensureNode
    };
};
