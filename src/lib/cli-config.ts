import * as fs from "node:fs";

import { cliConfigFile } from "./static.js";

interface Config {
  selectedProfile?: string;
}

const writeCliConfig = (data: Config) => {
  fs.writeFileSync(cliConfigFile, JSON.stringify(data));
};

const doesCliConfigExist = (): boolean => fs.existsSync(cliConfigFile);

const readCliConfig = (): Config =>
  doesCliConfigExist()
    ? JSON.parse(fs.readFileSync(cliConfigFile, "utf8"))
    : {};

export const setProfile = (profile: string) => {
  const config = readCliConfig();
  config.selectedProfile = profile;
  writeCliConfig(config);
};
