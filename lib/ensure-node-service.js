const temp = require("temp");

module.exports = ({ logMessage, execSync, sudoExec, downloadFile, stringFormat }) => {
    const getDependencyPath = ({ getNodeCommand }) => {
        let nodePath = "";

        try {
            nodePath = execSync(getNodeCommand);

            logMessage(`Node found at location: ${nodePath}`);
        } catch (error) {
            logMessage(`Node not found. Error:\n${error}`);
        }

        return nodePath.toString();
    };

    const downloadNodeInstaller = ({ nodeDownloadAddress, nodeInstallerSuffix }, nodeVersion) => {
        const address = stringFormat(nodeDownloadAddress, nodeVersion);

        return downloadFile(address, nodeInstallerSuffix);
    };

    const installNode = ({ installCommand }, pathToExecutable) => {
        const command = stringFormat(installCommand, pathToExecutable);

        return sudoExec(command);
    };

    const removeNPMFromNodeModules = ({ removeGlobalPackageCommand }) => {
        const removeNPMCommand = stringFormat(removeGlobalPackageCommand, "npm");

        return sudoExec(removeNPMCommand);
    };

    const ensureNode = (config, nodeVersion = "6.11.4") => {
        const nodePath = getDependencyPath(config);

        if (nodePath) {
            return Promise.resolve();
        }

        temp.track();

        return downloadNodeInstaller(config, nodeVersion)
            .then(installNode.bind(null, config))
            .then(() => {
                temp.cleanupSync();
            })
            .then(removeNPMFromNodeModules.bind(null, config))
            .catch(error => {
                temp.cleanupSync();

                return Promise.reject(error);
            });
    };

    return {
        ensureNode
    };
};
