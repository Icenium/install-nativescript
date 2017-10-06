module.exports = ({ logMessage, execSync, sudoExec, stringFormat }) => {
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

    const ensureCLI = (config, cliVersion) => {
        const cliPath = getDependencyPath(config);

        if (cliPath) {
            return Promise.resolve();
        }

        return installCLI(config, cliVersion);
    };

    return {
        ensureCLI
    };
};
