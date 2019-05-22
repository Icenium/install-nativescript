# install-nativescript
Package that helps you install Node.js, npm and nativescript-cli from within an Electron app. Works only on Windows and Mac.

## Usage

1. First install the package:
```
npm install --save install-nativescript
```

2. Now use it in your code:
```
const installNativeScript = require("install-nativescript");

installNativeScript.ensureNode()
    .then(() => {
        return installNativeScript.ensureCLI();
    })
```

## Public API
* [ensureNode](#ensurenode)
* [ensureCLI](#ensurecli)
* [getNPMFoldersWithMissingPermissions](#getnpmfolderswithmissingpermissions)
* [fixMissingNPMPermissions](#fixmissingnpmpermissions)

### ensureNode
The `ensureNode` method checks if node is installed on the machine. In case it cannot detect it, the method downloads a node installer and runs it. You can pass a specific node version to install. In case it is not provided, the method installs version 10.15.3.

Note: This method changes process.env so that after it succeeds, you can install and detect globally installed npm modules.

Usage:
```JavaScript
const installNativeScript = require("install-nativescript");

installNativeScript.ensureNode();
```

### ensureCLI
The `ensureCLI` method checks if you have NativeScript CLI installed globally on your machine. 

- In case it cannot detect it, the method installs it globally using npm. You can pass a specific NativeScript CLI version to install. In case it is not provided, the method installs the latest official version.
- In case it detects a version, the method will update it in case you pass a specific versionRange and the current version does not satisfy the requirement. Again, in case a specific version is not provided, the method installs the latest official version.

Usage:
```JavaScript
const installNativeScript = require("install-nativescript");

installNativeScript.ensureCLI();
```

### getNPMFoldersWithMissingPermissions
One of the reasons why `ensureCLI` method may fail on Mac machines, is in case some npm folders require root access. This method can help you detect this case. Just pass the error from `ensureCLI` and it will return an array of folders that might require root access. In case the array is empty, the error is not related to missing permissions.

Usage:
```JavaScript
const installNativeScript = require("install-nativescript");

installNativeScript.ensureCLI()
    .catch((error) => {
        const permissionsFolders = installNativeScript.getNPMFoldersWithMissingPermissions(error);
    });
```

### fixMissingNPMPermissions
The `fixMissingNPMPermissions` method accepts an array of folders and tries to change their permissions.

Usage:
```JavaScript
const installNativeScript = require("install-nativescript");

installNativeScript.ensureCLI()
    .catch((error) => {
        const permissionsFolders = installNativeScript.getNPMFoldersWithMissingPermissions(error);

        if (permissionsFolders.length === 0) {
            return Promise.reject(error);
        }

        // It is a good idea to ask the user at this point if they approve the change and then change the permissions.

        return installNativeScript.fixMissingNPMPermissions(permissionsFolders)
            .then(() => {
                return installNativeScript.ensureCLI();
            });
    });
```
