const _ = require("lodash");
const fs = require("fs");

module.exports = (helpers, config) => {
    const eaccessCodeString = /code:\s*'(EACCES|EPERM)'/;
    const npmPrefixPathSuffixes = ["/lib/node_modules", "/lib/bin", "/lib/share"];

    const { logMessage, execSync, sudoExec, stringFormat } = helpers;
    const { getPrefixPathCommand, getCachePathCommand, fixNPMPermissionsCommand } = config;

    const getNPMFoldersWithMissingPermissions = (stderr) => {
        if (_.isEmpty(getPrefixPathCommand) || _.isEmpty(getCachePathCommand) || !eaccessCodeString.test(stderr)) {
            return [];
        }

        let npmPrefixFolder = "";
        let npmCacheFolder = "";

        try {
            npmPrefixFolder = execSync(getPrefixPathCommand);
            npmCacheFolder = execSync(getCachePathCommand);
        } catch (error) {
            logMessage(`Get npm config failed. Error:\n${error}`);

            npmPrefixFolder = "";
            npmCacheFolder = "";
        }

        if (!npmPrefixFolder || !npmCacheFolder) {
            logMessage(`NPM config folders are missing.`);

            return [];
        }

        const folders = _.map(npmPrefixPathSuffixes, (suffix) => {
            return `${npmPrefixFolder}${suffix}`;
        });

        folders.push(npmCacheFolder);

        _.remove(folders, (folder) => {
            return !fs.existsSync(folder);
        });

        logMessage(`NPM config folders: ${folders.join(", ")}`);

        return folders;
    };

    const fixMissingNPMPermissions = (folderPaths) => {
        if (_.isEmpty(folderPaths)) {
            logMessage("No folders with incorrect permissions.");

            return Promise.resolve();
        }

        if (_.isEmpty(fixNPMPermissionsCommand)) {
            logMessage("Fix missing permissions is not supported.");

            return Promise.resolve();
        }

        const folderExpression = _.chain(folderPaths)
            .map(folderPath => `'${folderPath}'`)
            .join(" ")
            .value();
        const command = stringFormat(fixNPMPermissionsCommand, folderExpression);

        return sudoExec(command);
    };

    return {
        getNPMFoldersWithMissingPermissions,
        fixMissingNPMPermissions
    };
};
