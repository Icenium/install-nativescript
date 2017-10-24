const _ = require("lodash");
const getShellVars = require("get-shell-vars");

const { platform } = process;

module.exports = ({ logMessage, sudoExec }, { getPATHCommand }) => {
    const pathCanChange = platform === "win32";
    let originalPATH = "";

    const init = () => {
        if (!pathCanChange) {
            return Promise.resolve();
        }

        logMessage(`Original PATH value: ${process.env.PATH}`);

        return sudoExec(getPATHCommand)
            .then((result) => {
                originalPATH = _.trim(result);
            });
    };

    const updatePATH = () => {
        if (!pathCanChange) {
            return Promise.resolve();
        }

        return sudoExec(getPATHCommand)
            .then((newPATH) => {
                newPATH = _.trim(newPATH);

                if (originalPATH === newPATH) {
                    return;
                }

                process.env.PATH = newPATH;

                logMessage(`Result PATH value: ${process.env.PATH}`);
            });
    };

    const updateENV = () => {
        return updatePATH()
            .then(() => {
                const additionalProcessEnv = getShellVars.getEnvironmentVariables();

                _.merge(process.env, additionalProcessEnv);

                logMessage(`Result process.env value: ${process.env}`);
            });
    };

    return {
        init,
        updateENV
    };
};
