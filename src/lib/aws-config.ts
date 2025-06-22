// Lots of snake_case names needed for the aws config file
/* eslint-disable camelcase */
import * as fs from "node:fs";
import * as path from "node:path";

import { IniContent, IniSection, emptyIniContent, fromIni, toIni } from "./ini-parser/parser.js";
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

const buildSsoSession = (
  ssoName: string,
  { ssoRegion, startUrl }: SsoMetadata,
): [string, IniSection] => [
  ssoName,
  {
    sso_region: ssoRegion,
    sso_registration_scopes: "sso:account:access",
    sso_start_url: startUrl,
  },
];

const buildProfile = (
  ssoName: string,
  { regionResolver }: SsoMetadata,
  roleInfo: RoleInfo,
): [string, IniSection] => {
  const { accountId, accountName, profileName, roleName } = roleInfo;
  return [
    profileName,
    {
      region: regionResolver(roleInfo),
      sso_account_id: accountId,
      sso_account_name: accountName,
      sso_role_name: roleName,
      sso_session: ssoName,
    },
  ];
};

const unRelatedEntries = (
  ssoName: string,
  ssoStartUrl: string,
  profiles: Map<string, IniSection>,
): Map<string, IniSection> => {
  const filtered = new Map<string, IniSection>();
  for (const [k, v] of profiles.entries()) {
    if (v.sso_session === ssoName || v.sso_start_url === ssoStartUrl) {
      filtered.set(k, v);
    }
  }

  return filtered;
};

/**
 * Adds the new profiles and sso session to the existing structure
 * Replaces an existing profiles and sso session if they have the same name or start url
 */
const mergeProfiles = (
  iniData: IniContent,
  newProfiles: Map<string, IniSection>,
  newSsoSession: [string, IniSection],
): IniContent => {
  const ssoName = newSsoSession[0];
  const ssoStartUrl = newSsoSession[1].sso_start_url;
  const newIniData = { ...iniData };

  // merge profiles
  const unrelatedProfiles = unRelatedEntries(ssoName, ssoStartUrl, iniData.profiles);
  newIniData.profiles = new Map([...unrelatedProfiles, ...newProfiles]);

  // merge sso sessions
  const unrelatedSessions = unRelatedEntries(ssoName, ssoStartUrl, iniData.ssoSessions);
  newIniData.ssoSessions = new Map([...unrelatedSessions, newSsoSession]);

  return newIniData;
};

const extractSsoName = (ssoStartUrl: string): string => {
  const urlNoScheme = ssoStartUrl.split("://")[1];
  return urlNoScheme.split(".")[0];
};

/**
 * Adds the new profiles and sso session to the existing config
 * Replaces an existing profiles and sso session if they have the same name or start url
 */
export const updateProfiles = (ssoMetadata: SsoMetadata, profiles: RoleInfo[]) => {
  const ssoName = extractSsoName(ssoMetadata.startUrl);
  const newProfiles = new Map(profiles.map((x) => buildProfile(ssoName, ssoMetadata, x)));
  const newSsoSession = buildSsoSession(ssoName, ssoMetadata);
  const config = readConfig();
  const updatedConfig = mergeProfiles(config, newProfiles, newSsoSession);
  writeConfig(updatedConfig);
};

/**
 * Overwrites any existing profile(s) and sso-session(s) with the new ones
 */
export const overwriteProfiles = (ssoMetadata: SsoMetadata, profiles: RoleInfo[]) => {
  const ssoName = extractSsoName(ssoMetadata.startUrl);
  const newProfiles = new Map(profiles.map((x) => buildProfile(ssoName, ssoMetadata, x)));
  const newSsoSession = buildSsoSession(ssoName, ssoMetadata);
  const config = readConfig();
  const updatedConfig = {
    profiles: newProfiles,
    services: config.services,
    ssoSessions: new Map([newSsoSession]),
  };
  writeConfig(updatedConfig);
};

const ensureAwsFolder = () => {
  const folder = path.dirname(awsConfigFile);
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
};

export const readConfig = (): IniContent => {
  const exists = fs.existsSync(awsConfigFile);
  if (!exists) {
    return emptyIniContent();
  }

  const configText = fs.readFileSync(awsConfigFile, "utf8");
  return fromIni(configText);
};

export const writeConfig = (config: IniContent) => {
  ensureAwsFolder();
  const configText = toIni(config);
  fs.writeFileSync(awsConfigFile, configText, { flag: "w" });
};
