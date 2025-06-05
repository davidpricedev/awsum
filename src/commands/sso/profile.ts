import { Command, Flags } from "@oclif/core";
import fs from "node:fs";
import os from "node:os";

import { readConfig, readProfiles } from "../../lib/aws-config.js";
import { setProfile } from "../../lib/cli-config.js";
import { selectedProfileFile } from "../../lib/static.js";
import { showAutocompletePrompt } from "../../lib/ux.js";

export default class Profile extends Command {
  static args = {};

  static description = "choose an aws profile";

  static examples = [`<%= config.bin %> <%= command.id %>`];

  static flags = {
    quiet: Flags.boolean({
      char: "q",
      description: "suppress text output",
      required: false,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Profile);
    const profiles = readProfiles();
    const fullConfig = readConfig();
    console.log("Full Config::", fullConfig);
    if (profiles.length === 0) {
      this.error("No profiles found in ~/.aws/config");
    }

    const choice = await showAutocompletePrompt("Choose the profile you want to use: ", profiles);
    // write to file
    setProfile(choice);
    writeProfileSelection(choice);
    if (!flags.quiet) {
      this.log("To make this your active profile, run:");
      this.log(`export AWS_PROFILE="${choice}"`);
    }
  }
}

const writeProfileSelection = (profileName: string) => {
  fs.writeFileSync(`${os.homedir()}/${selectedProfileFile}`, profileName, {
    flag: "w",
  });
};
