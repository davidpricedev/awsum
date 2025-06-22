/*
ini parser for AWS SSO configuration files.
No attempt will be made to handle anything other than AWS SSO configuration files.
Existing ini parsers did not handle the profile section headers correctly
We'll simply ignore and delete all comments
This will be very simple and not very flexible.
It is expected that this tool will manage most/all of this file anyway, so additional flexibility should not be needed.
*/
import * as fs from "node:fs";

import { awsConfigFile } from "../static.js";

/**
 * Represents the content of an AWS configuration file
 */
export interface IniContent {
  // [profile profileName] (also, a special case for [default])
  profiles: Map<string, IniSection>;
  // [services profileName] services are not parsed, but passed through as-is
  services: Map<string, string[]>;
  // [sso-session ssoName]
  ssoSessions: Map<string, IniSection>;
}

export interface IniSection {
  [key: string]: string;
}

interface IniHeader {
  name: string;
  type: string;
}

export const emptyIniContent = (): IniContent => ({
  profiles: new Map<string, IniSection>(),
  services: new Map<string, string[]>(),
  ssoSessions: new Map<string, IniSection>(),
});

export const readConfig = (file?: string): string => {
  const configFile = file || awsConfigFile;
  const exists = fs.existsSync(configFile);
  if (!exists) {
    return "";
  }

  return fs.readFileSync(configFile, "utf8");
};

const isSectionHeader = (line: string): boolean =>
  line.trim().startsWith("[") && line.trim().endsWith("]");

const parseHeader = (line: string): IniHeader => {
  if (line.trim() === "[default]") {
    return { name: "default", type: "profile" };
  }

  const [type, name] = line.trim().replace("[", "").replace("]", "").split(" ");
  return { name, type };
};

const isComment = (line: string): boolean =>
  line.trim().startsWith("#") || line.trim().startsWith(";");

const sectionTypeToKey = (type: string): keyof IniContent => {
  const themap = {
    profile: "profiles",
    services: "services",
    "sso-session": "ssoSessions",
  };
  // jump through typescript hoops
  const happyType = type as keyof typeof themap;
  const retval = themap[happyType] || "profiles";
  return retval as keyof IniContent;
};

export const fromIni = (config: string): IniContent => {
  const configLines = config
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const configAsJson: IniContent = emptyIniContent();
  let currentSection: IniSection = {};
  let currentServices: string[] = [];
  let sectionType: keyof IniContent = "profiles";
  for (const line of configLines) {
    if (isComment(line)) {
      continue; // Skip comments
    }

    if (isSectionHeader(line)) {
      const header = parseHeader(line);
      sectionType = sectionTypeToKey(header.type);
      if (sectionType === "services") {
        currentServices = configAsJson.services.get(header.name) || [];
        configAsJson.services.set(header.name, currentServices);
      } else {
        currentSection = configAsJson[sectionType].get(header.name) || {};
        configAsJson[sectionType].set(header.name, currentSection);
      }
    } else if (currentServices && sectionType === "services") {
      currentServices.push(line);
    } else if (currentSection) {
      const [key, value] = line.split("=");
      if (key && value) {
        currentSection[key.trim()] = value.trim();
      }
    }
  }

  return configAsJson;
};

const sectionToIni = (sectionIniType: string, sectionName: string, section: IniSection): string => {
  const lines: string[] = [];
  lines.push(`[${sectionIniType} ${sectionName}]`);
  for (const [key, value] of Object.entries(section)) {
    lines.push(`${key} = ${value}`);
  }

  lines.push("");
  return lines.join("\n");
};

const servicesToIni = (sectionName: string, content: string[]): string => {
  const lines: string[] = [];
  lines.push(`[services ${sectionName}]`);
  for (const value of content) {
    lines.push(value);
  }

  lines.push("");
  return lines.join("\n");
};

export const toIni = (config: IniContent): string => {
  const blocks: string[] = [];

  for (const [name, value] of config.ssoSessions.entries()) {
    blocks.push(sectionToIni("sso-session", name, value));
  }

  for (const [name, value] of config.profiles.entries()) {
    blocks.push(sectionToIni("profile", name, value));
  }

  for (const [name, value] of config.services.entries()) {
    blocks.push(servicesToIni(name, value));
  }

  return blocks.join("\n");
};
