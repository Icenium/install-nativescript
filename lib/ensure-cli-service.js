module.exports = ({ logMessage, execSync, sudoExec, downloadFile, stringFormat }) => {
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

    const installCLI = ({ installCLICommand }) => {
        return sudoExec(installCLICommand);
    };

    const ensureCLI = (config) => {
        const cliPath = getDependencyPath(config);

        if (cliPath) {
            return Promise.resolve();
        }

        return installCLI(config);
    };

    return {
        ensureCLI
    };
};
