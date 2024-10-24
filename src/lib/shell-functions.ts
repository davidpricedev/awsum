import fs from "node:fs";
import * as os from "node:os";

import { cmdName, functionFile, selectedProfileFile } from "./static.js";
import { stripIndent } from "./strings.js";

export const shellFunctionsContent = stripIndent(`
  ###--- ${cmdName} functions ---###

  ## Select an AWS SSO profile to use
  function ${cmdName}-sso-switch() {
    ${cmdName} sso profile -q
    if [ -f ~/${selectedProfileFile} ]; then
      selectedProfile="$(cat ~/${selectedProfileFile})"
    fi

    if [ -z "$selectedProfile" ]; then
      unset AWS_PROFILE
    else
      export AWS_PROFILE="$selectedProfile"
    fi
  }
`);

export const writeFunctionsFile = () => {
  const filename = `${os.homedir()}/${functionFile}`;
  fs.writeFileSync(filename, shellFunctionsContent);
};

export const installFunctions = (shell: string): void => {
  writeFunctionsFile();
  appendSourceToRc(shell);
};

export const appendSourceToRc = (shell: string): void => {
  const shellFileName = shell === "bash" ? ".bashrc" : ".zshrc";
  const fullShellRcName = `${os.homedir()}/${shellFileName}`;
  const shellFileExists = fs.existsSync(fullShellRcName);
  if (!shellFileExists) {
    console.error(`Could not find ${shellFileName} in your home directory`);
    return;
  }

  const shellFile = fs.readFileSync(fullShellRcName, "utf8");
  if (!shellFile) {
    console.error(`Could not read ${shellFileName}`);
    return;
  }

  if (shellFile.includes(functionFile)) {
    console.log("cli functions already installed");
    return;
  }

  const shellSource = stripIndent(`
    ###--- ${cmdName} functions ---###
    source ~/${functionFile}
  `);
  fs.appendFileSync(fullShellRcName, shellSource);
};
