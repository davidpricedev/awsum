import { Command, Flags } from "@oclif/core";
import fs from "node:fs";
import os from "node:os";

import { readConfig } from "../../lib/aws-config.js";
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
    if (profiles.size === 0) {
      this.error("No profiles found in ~/.aws/config");
    }

    const choice = await showAutocompletePrompt("Choose the profile you want to use: ", [
      ...profiles.keys(),
    ]);
    // write to file
    const chosenProfile = profiles.get(choice) || choice;
    setProfile(chosenProfile);
    writeProfileSelection(chosenProfile);
    if (!flags.quiet) {
      this.log("To make this your active profile, run:");
      this.log(`export AWS_PROFILE="${chosenProfile}"`);
    }
  }
}

const writeProfileSelection = (profileName: string) => {
  fs.writeFileSync(`${os.homedir()}/${selectedProfileFile}`, profileName, {
    flag: "w",
  });
};

/**
 * Show the ssoName in addition to the profile name when showing the list
 */
const readProfiles = (): Map<string, string> => {
  const config = readConfig();
  const profiles = new Map<string, string>();
  for (const [k, v] of config.profiles.entries()) {
    const label = v.sso_session ? `[${v.sso_session}] ${k}` : k;
    profiles.set(label, k);
  }

  return profiles;
};
