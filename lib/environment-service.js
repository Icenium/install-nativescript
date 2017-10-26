const _ = require("lodash");
const getShellVars = require("get-shell-vars");

module.exports = ({ logMessage, sudoExec }, { getPATHCommand }) => {
    let originalPATH = "";

    const init = () => {
        if (_.isEmpty(getPATHCommand)) {
            return Promise.resolve();
        }

        logMessage(`Original PATH value: ${process.env.PATH}`);

        return sudoExec(getPATHCommand)
            .then((result) => {
                originalPATH = _.trim(result);
            });
    };

    const updatePATH = () => {
        if (_.isEmpty(getPATHCommand)) {
            logMessage("Update PATH not supported.");

            return Promise.resolve();
        }

        return sudoExec(getPATHCommand)
            .then((newPATH) => {
                newPATH = _.trim(newPATH);

                if (_.isEmpty(originalPATH) || _.isEmpty(newPATH) || originalPATH === newPATH) {
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
