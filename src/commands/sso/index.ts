import { Command } from "@oclif/core";

import { getAwsContext } from "../../lib/aws-context.js";
import { verticalTable } from "../../lib/ux.js";

export default class Whoami extends Command {
  static args = {};

  static description = "Show current AWS context information";

  static examples = [`<%= config.bin %> <%= command.id %>`];

  static flags = {};

  async run(): Promise<void> {
    const results = await getAwsContext();
    if (!results) {
      this.error("Unable to retrieve AWS context");
    }

    const tableStr = verticalTable([
      { "region(cli)": results?.cliRegion },
      { "region(sdk)": results?.sdkRegion },
      { profile: results?.profile },
      { ssoRole: results?.ssoRole },
      { account: results?.account },
      { userId: results?.userId },
      { awsVars: results?.awsVars.join(",\n") },
    ]);
    this.log(tableStr);
  }
}
