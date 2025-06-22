import { Command, Flags } from "@oclif/core";

/**
 * Simply a proxy for `aws sso login`
 */
export default class Login extends Command {
  static args = {};

  static description = "Login to AWS SSO";

  static examples = [`<%= config.bin %> <%= command.id %>`];

  static flags = {
    profile: Flags.string({
      char: "p",
      description: "AWS profile to use",
      required: false,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Login);
    const envProfile = process.env.AWS_PROFILE;
    if (!flags.profile && !envProfile) {
      this.error(
        "No AWS profile specified, please use --profile or set AWS_PROFILE environment variable",
      );
    }

    console.log("[deprecated] This command is deprecated, use `aws sso login` instead.");
  }
}
