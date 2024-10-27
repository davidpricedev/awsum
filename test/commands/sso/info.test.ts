import { runCommand } from "@oclif/test";
import { expect } from "chai";

describe("sso", () => {
  it("runs sso", async () => {
    const { stdout } = await runCommand("sso info");
    expect(stdout).to.contain("ssoRole");
  });
});
