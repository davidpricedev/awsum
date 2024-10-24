import { Args, Command } from "@oclif/core";

import { installFunctions } from "../../lib/shell-functions.js";
import { cmdName, functionFile } from "../../lib/static.js";
import { stripIndent } from "../../lib/strings.js";
import { infoBox } from "../../lib/ux.js";

export default class InstallSwitcher extends Command {
  static args = {
    shell: Args.string({ description: "shell (bash or zsh)", required: true }),
  };

  static description =
    "Install a profile switcher function into your .zshr/.basrc file";

  static examples = [`<%= config.bin %> <%= command.id %>`];

  static flags = {};

  async run(): Promise<void> {
    const { args } = await this.parse(InstallSwitcher);
    const { shell } = args;
    const shellFunctionName = `${cmdName}-sso-switch`;

    installFunctions(shell);

    const message = `
      Profile switcher function installed.
      Restart your shell or run the following command to start using it:
        source ${functionFile}
      You can then switch profiles by running
        ${shellFunctionName}
    `;
    this.log(infoBox(stripIndent(message)));
  }
}
