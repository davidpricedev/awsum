import * as fs from "node:fs";

import { awsConfigFile } from "./static.js";

export interface SsoMetadata {
  regionResolver: (roleInfo: RoleInfo) => string;
  ssoRegion: string;
  startUrl: string;
}

export interface RoleInfo {
  accountId: string;
  accountName: string;
  profileName: string;
  roleName: string;
}

const buildSsoSession = ({ ssoRegion, startUrl }: SsoMetadata) => {
  const lines = [
    "[sso-session mysso]",
    `sso_start_url = ${startUrl}`,
    `sso_region = ${ssoRegion}`,
    "sso_registration_scopes = sso:account:access",
    "",
  ];
  return lines.join("\n");
};

const buildSessionLinkedProfile = ({ regionResolver }: SsoMetadata, roleInfo: RoleInfo) => {
  const { accountId, accountName, profileName, roleName } = roleInfo;
  const lines = [
    `[profile ${profileName}]`,
    `sso_session = mysso`,
    `sso_account_name = ${accountName}`,
    `sso_account_id = ${accountId}`,
    `sso_role_name = ${roleName}`,
    `region = ${regionResolver(roleInfo)}`,
    "",
  ];
  return lines.join("\n");
};

const buildSelfContainedProfile = (
  { regionResolver, ssoRegion, startUrl }: SsoMetadata,
  roleInfo: RoleInfo,
) => {
  const { accountId, accountName, profileName, roleName } = roleInfo;
  const lines = [
    `[profile ${profileName}]`,
    `sso_start_url = ${startUrl}`,
    `sso_region = ${ssoRegion}`,
    "sso_registration_scopes = sso:account:access",
    `sso_account_name = ${accountName}`,
    `sso_account_id = ${accountId}`,
    `sso_role_name = ${roleName}`,
    `region = ${regionResolver(roleInfo)}`,
    "",
  ];
  return lines.join("\n");
};

const buildAppendProfiles = (ssoMetadata: SsoMetadata, profiles: RoleInfo[]) => {
  const lines = ["", profiles.map((x) => buildSelfContainedProfile(ssoMetadata, x)).join("\n"), ""];
  return lines.join("\n");
};

export const appendProfiles = (ssoMetadata: SsoMetadata, profiles: RoleInfo[]) => {
  const configText = buildAppendProfiles(ssoMetadata, profiles);
  ensureAwsFolder();
  fs.appendFileSync(awsConfigFile, configText, { flag: "a" });
};

const buildOverwriteProfiles = (ssoMetadata: SsoMetadata, profiles: RoleInfo[]) => {
  const lines = [
    buildSsoSession(ssoMetadata),
    profiles.map((x) => buildSessionLinkedProfile(ssoMetadata, x)).join("\n"),
    "",
  ];
  return lines.join("\n");
};

export const overwriteProfiles = (ssoMetadata: SsoMetadata, profiles: RoleInfo[]) => {
  const configText = buildOverwriteProfiles(ssoMetadata, profiles);
  ensureAwsFolder();
  fs.writeFileSync(awsConfigFile, configText, { flag: "w" });
};

// Maybe switch to using ini parser?
// might be useful to set the region from the profile data
export const readProfiles = (): string[] => {
  const exists = fs.existsSync(awsConfigFile);
  if (!exists) {
    return [];
  }

  const config = fs.readFileSync(awsConfigFile, "utf8");
  const lines = config.split("\n");
  return lines
    .filter((x) => x.startsWith("[profile"))
    .map((x) => x.replace("[profile ", "").replace("]", "").trim());
};

export const findSsoConfigs = () => {
  const exists = fs.existsSync(awsConfigFile);
  if (!exists) {
    return { regions: [], urls: [] };
  }

  const config = fs.readFileSync(awsConfigFile, "utf8");
  const lines = config.split("\n");
  const regions = lines.filter((x) => x.includes("sso_region")).map((x) => x.split(" = ")[1]);
  const urls = lines.filter((x) => x.includes("sso_start_url")).map((x) => x.split(" = ")[1]);
  return { regions, urls };
};

const ensureAwsFolder = () => {
  const folder = awsConfigFile.split("/").slice(0, -1).join("/");
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
};
