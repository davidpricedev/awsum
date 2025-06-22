// Lots of snake_case names needed for the aws config file
/* eslint-disable camelcase */
import * as fs from "node:fs";
import * as path from "node:path";

import { IniContent, IniSection, emptyIniContent, fromIni, toIni } from "./ini-parser/parser.js";
import { awsConfigFile } from "./static.js";
import { objFilter, objFilterFn, objKeys } from "./util.js";

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
): Record<string, IniSection> => ({
  [ssoName]: {
    sso_region: ssoRegion,
    sso_registration_scopes: "sso:account:access",
    sso_start_url: startUrl,
  },
});

const buildProfile = (
  ssoName: string,
  { regionResolver }: SsoMetadata,
  roleInfo: RoleInfo,
): Record<string, IniSection> => {
  const { accountId, accountName, profileName, roleName } = roleInfo;
  return {
    [profileName]: {
      region: regionResolver(roleInfo),
      sso_account_id: accountId,
      sso_account_name: accountName,
      sso_role_name: roleName,
      sso_session: ssoName,
    },
  };
};

const isEntryRelated =
  (ssoName: string, ssoStartUrl: string) =>
  (k: string, v: IniSection): boolean =>
    v.sso_session === ssoName || v.sso_start_url === ssoStartUrl;

const not =
  (fn: objFilterFn<IniSection>) =>
  (k: string, v: IniSection, i: number): boolean =>
    !fn(k, v, i);

/**
 * Adds the new profiles and sso session to the existing structure
 * Replaces an existing profiles and sso session if they have the same name or start url
 */
const mergeProfiles = (
  iniData: IniContent,
  newProfiles: Array<Record<string, IniSection>>,
  newSsoSession: Record<string, IniSection>,
): IniContent => {
  const ssoName = objKeys(newSsoSession)[0];
  const ssoStartUrl = newSsoSession[ssoName].sso_start_url;
  const newIniData = { ...iniData };

  // merge profiles
  const unrelatedProfiles = objFilter(iniData.profiles, not(isEntryRelated(ssoName, ssoStartUrl)));
  newIniData.profiles = { ...unrelatedProfiles, ...Object.assign({}, ...newProfiles) };

  // merge sso sessions
  const unrelatedSsoSessions = objFilter(
    iniData.ssoSessions,
    not(isEntryRelated(ssoName, ssoStartUrl)),
  );
  newIniData.ssoSessions = { ...unrelatedSsoSessions, ...newSsoSession };

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
  const newProfiles = profiles.map((x) => buildProfile(ssoName, ssoMetadata, x));
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
  const newProfiles = profiles.map((x) => buildProfile(ssoName, ssoMetadata, x));
  const newSsoSession = buildSsoSession(ssoName, ssoMetadata);
  const config = readConfig();
  const updatedConfig = {
    profiles: Object.assign({}, ...newProfiles),
    services: config.services,
    ssoSessions: newSsoSession,
  };
  writeConfig(updatedConfig);
};

export const readProfileNames = (): string[] => {
  const config = readConfig();
  return objKeys(config.profiles);
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
