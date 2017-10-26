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

    const getDependencyPath = () => {
        let nodePath = "";

        try {
            nodePath = execSync(getNodeCommand);

            logMessage(`Node found at location: ${nodePath}`);
        } catch (error) {
            logMessage(`Node not found. Error:\n${error}`);
        }

        return nodePath;
    };

    const checkNPMPath = () => {
        let npmPath = "";

        try {
            npmPath = execSync(getNPMCommand);

            logMessage(`NPM found at location: ${npmPath}`);
        } catch (error) {
            logMessage(`NPM not found. Error:\n${error}`);
        }

        return npmPath;
    };

    const downloadNodeInstaller = (nodeVersion) => {
        const address = stringFormat(nodeDownloadAddress, nodeVersion);

        return downloadFile(address, nodeInstallerSuffix);
    };

    const installNode = (nodeVersion) => {
        const nodePath = getDependencyPath();

        if (nodePath) {
            return Promise.reject("Node already installed.");
        }

        checkNPMPath();

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

    const ensureNode = (nodeVersion = "6.11.4") => {
        return findNode()
            .catch(() => {
                return installNode(nodeVersion)
                    .then(findNode);
            });
    };

    return {
        ensureNode
    };
};
