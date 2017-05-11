const fs = require("fs");
const path = require("path");
const temp = require("temp");
const https = require("https");
const childProcess = require("child_process");
const getShellVars = require("get-shell-vars");
const sudo = require("sudo-prompt");

const logFilePath = path.join(__dirname, "..", "mylog.log");
const logFile = fs.openSync(logFilePath, "a");
const env = getShellVars.getEnvironmentVariables();

const logMessage = (message) => {
    fs.writeSync(logFile, `${message}\n`);
};

const execSync = (command) => {
    logMessage(`Execute command ${command}`);

    return childProcess.execSync(command, { env });
};

const sudoExec = (command) => {
    logMessage(`Execute command ${command}`);

    return new Promise((resolve, reject) => {
        sudo
            .exec(command, { env, name: "Fusion" }, (error, stdout, stderr) => {
                logMessage(stderr);
                logMessage(stdout);

                if (error) {
                    logMessage(`Failed to execute ${command}.Error:\n${error}`);
                    reject(error);

                    return;
                }

                logMessage(`Successfully executed ${command}.`);
                resolve();
            });
    });
};

const downloadFile = (address, fileSuffix) => {
    return new Promise((resolve, reject) => {
        logMessage(`Start downloading file: ${address}`);

        https.get(address, (response) => {
            const downloadPath = temp.path({ suffix: fileSuffix });

            try {
                const writableStream = fs.createWriteStream(downloadPath);

                response.pipe(writableStream);

                writableStream.on("finish", () => {
                    setTimeout(() => {
                        logMessage(`Successfully downloaded file ${downloadPath}`);
                        resolve(downloadPath);
                    }, 100);
                }).on("error", (error) => {
                    logMessage(`Error while writing file ${downloadPath}:\n${error}`);
                    reject(error);
                });
            } catch (error) {
                logMessage(`Error during file download ${address} or pipe to ${downloadPath}:\n${error}`);
                reject(error);
            }
        }).on("error", (error) => {
            logMessage(`Error during get of ${address}:\n${error}`);
            reject(error);
        });
    });
};

const stringFormat = (rawString, ...values) => {
    return rawString.replace(/%\{([0-9])+\}/g, (match, index) => {
        return values[index];
    });
};

module.exports = {
    logMessage,
    execSync,
    sudoExec,
    downloadFile,
    stringFormat
};
