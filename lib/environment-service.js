const _ = require("lodash");

module.exports = ({ logMessage, sudoExec }, { getPATHCommand }) => {
    let originalPATH = "";

    logMessage(`Original PATH value: ${process.env.path}`);

    const init = () => {
        return sudoExec(getPATHCommand)
            .then((result) => {
                originalPATH = _.trim(result);
            });
    };

    const updatePath = () => {
        return sudoExec(getPATHCommand)
            .then((newPATH) => {
                newPATH = _.trim(newPATH);

                if (originalPATH === newPATH) {
                    return;
                }

                process.env.path = newPATH;

                logMessage(`Result PATH value: ${process.env.path}`);
            });
    };

    return {
        init,
        updatePath
    };
};
