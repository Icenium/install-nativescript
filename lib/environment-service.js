const path = require("path");
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

                const originalEntries = originalPATH.split(path.delimiter);
                const newEntries = newPATH.split(path.delimiter);

                const diff = newEntries.filter((entry) => {
                    const isMissing = entry && !originalEntries.includes(entry);

                    if (isMissing) {
                        logMessage(`Missing PATH entry: ***${entry}***`);
                    }

                    return isMissing;
                });

                const additionToPATH = diff.join(path.delimiter);

                if (!additionToPATH) {
                    return;
                }

                logMessage(`Adding to PATH: ${additionToPATH}`);

                process.env.path = `${additionToPATH}${path.delimiter}${process.env.path}`;

                logMessage(`Result PATH value: ${process.env.path}`);
            });
    };

    return {
        init,
        updatePath
    };
};
