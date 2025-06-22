import { Command, Flags } from "@oclif/core";
import os from "node:os";
import ora from "ora";

import { SsoMetadata, overwriteProfiles, updateProfiles } from "../../lib/aws-config.js";
import {
  createToken,
  fetchAccountsAndRoles,
  registerClient,
  startDeviceAuthorization,
} from "../../lib/aws-sso.js";
import { execCommand } from "../../lib/shell.js";
import { installFunctions } from "../../lib/shell-functions.js";
import { cmdName, defaultRegion } from "../../lib/static.js";
import { stripIndent } from "../../lib/strings.js";
import {
  infoBox,
  prettyTable,
  showChoicePrompt,
  showTextPrompt,
  waitForEnter,
} from "../../lib/ux.js";

// Running this too often might result in a rate limit error
// > TooManyRequestsException: HTTP 429 Unknown Code
/**
 * Referenced https://blog.christophetd.fr/phishing-for-aws-credentials-via-aws-sso-device-code-authentication/ for the flow
 */
export default class Setup extends Command {
  static args = {};

  static description = "Sets up SSO for the first time";

  static examples = [`<%= config.bin %> <%= command.id %>`];

  static flags = {
    ssoRegion: Flags.string({
      char: "r",
      description: "sso region",
      required: false,
    }),
    startUrl: Flags.string({
      char: "s",
      description: "sso start url",
      required: false,
    }),
  };

  async run(): Promise<void> {
    const message = `
      This command will find and configure your SSO profiles.
      It will generate a device code and prompt you to approve it in your browser. Once approved, it will fetch your accounts and roles and generate profile entries in your AWS config file.
    `;
    this.log(infoBox(stripIndent(message)));

    const { flags } = await this.parse(Setup);
    const { ssoRegion, startUrl } = flags;
    const ssoMetadata = await ensureSsoMetadata(ssoRegion, startUrl);
    // Make sure everything is using the sso region
    process.env.AWS_REGION = ssoMetadata.ssoRegion;
    process.env.AWS_DEFAULT_REGION = ssoMetadata.ssoRegion;

    const spinner = ora("Generating Device Code ...").start();
    const { clientId, clientSecret } = await registerClient(os.hostname());
    const deviceAuthResult = await startDeviceAuthorization(
      clientId ?? "",
      clientSecret ?? "",
      ssoMetadata.startUrl,
    );
    const { deviceCode, verificationUriComplete: url } = deviceAuthResult;
    spinner.stop();
    this.log("Device Code: ", deviceCode);
    this.log("Verification URL: ", url);
    // open url in a separate browser. linux/windows users may have to manually do this
    execCommand(`open ${url}`);
    await waitForEnter(
      "Press enter to continue after approving the device code in your browser ...",
    );

    spinner.text = "Getting Accounts and Roles ...";
    spinner.start();
    const { accessToken } = await createToken(clientId ?? "", clientSecret ?? "", deviceCode ?? "");
    const roles = await fetchAccountsAndRoles(accessToken ?? "");
    spinner.stop();
    this.log("Accounts and Roles:");
    this.log(prettyTable((x) => x.profileName, roles));

    const profileDecision = await showChoicePrompt(
      "Do you wish to overwrite or update your existing AWS config?",
      ["overwrite", "append"],
    );
    if (profileDecision === "overwrite") {
      overwriteProfiles(ssoMetadata, roles);
    } else {
      updateProfiles(ssoMetadata, roles);
    }

    // future: look to see if it is already installed, and skip if so
    const shell = await showChoicePrompt(
      "What shell do you wish to install the profile switcher for?",
      ["zsh", "bash", "skip"],
    );
    if (shell !== "skip") {
      installFunctions(shell);
    }

    const shellFunctionName = `${cmdName}-sso-switch`;
    const concludeMessage = stripIndent(`
      All done. You can now use your newly configured profiles!
      To do so:
      Restart your shell or source the function file to register the profile-switcher function.
      Switch profiles by running "${shellFunctionName}".
      If you skipped installing the function, you can add it by running "${cmdName} sso install-switcher".
      Login daily with "aws sso login".
      Use "${cmdName} sso info" to show your current information.
    `);
    this.log(infoBox(concludeMessage));
  }
}

const ensureSsoMetadata = async (ssoRegion: string | undefined, startUrl: string | undefined) => {
  const ssoMetadata: SsoMetadata = {
    regionResolver(_roleInfo: any) {
      return process.env.AWS_DEFAULT_REGION || defaultRegion;
    },
    ssoRegion: ssoRegion || process.env.AWS_DEFAULT_SSO_REGION || "",
    startUrl: startUrl || process.env.AWS_DEFAULT_SSO_START_URL || "",
  };

  if (!ssoMetadata.startUrl) {
    const startUrl = await showTextPrompt(
      "What is your SSO start URL? (e.g. https://my-sso-portal.awsapps.com/start)",
    );
    if (startUrl.startsWith("https://")) {
      console.log("Using SSO start URL:", startUrl);
      ssoMetadata.startUrl = startUrl;
    } else {
      console.log("Using SSO start URL:", `https://${startUrl}`);
      ssoMetadata.startUrl = `https://${startUrl}`;
    }
  }

  if (!ssoMetadata.ssoRegion) {
    const ssoRegion = await showTextPrompt("What is your SSO region? (e.g. us-east-1)");
    console.log("Using SSO region:", ssoRegion);
    ssoMetadata.ssoRegion = ssoRegion;
  }

  return ssoMetadata;
};
