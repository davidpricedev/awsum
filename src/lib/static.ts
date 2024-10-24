import * as os from "node:os";

// region to use when no region is specified otherwise
export const defaultRegion = "us-east-2";

// the standard aws config file location
export const awsConfigFile = `${os.homedir()}/.aws/config`;

// Shell command information
export const cmdName = "gacs";
export const functionFile = `.${cmdName}-shell-functions`;

// A file for storing the name of the selected profile
export const selectedProfileFile = `.${cmdName}-selected-profile`;

// The config file for this cli utility
export const cliConfigFile = `${os.homedir()}/.config/${cmdName}.json`;
