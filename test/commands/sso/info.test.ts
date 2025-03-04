import { runCommand } from "@oclif/test";
import { expect } from "chai";

describe("sso info", () => {
  it("will contain userId field", async () => {
    const { stderr, stdout } = await runCommand("sso info");
    console.log("stdout:", stdout);
    console.log("stderr:", stderr);
    expect(stdout).to.contain("userId");
  });
});
