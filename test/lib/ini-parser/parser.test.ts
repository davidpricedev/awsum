import { expect } from "chai";
import * as fs from "node:fs";

import { fromIni, readConfig, toIni } from "../../../src/lib/ini-parser/parser";

describe("ini-parser", () => {
  describe("fromIni", () => {
    it("should parse a simple ini string into JSON", () => {
      const iniString = `
        [profile test]
        key1 = value1
        key2 = value2

        [services test]
        service1
        service2

        [sso-session test]
        ssoKey = ssoValue
      `;
      const result = fromIni(iniString);

      // Profiles
      expect(result.profiles.has("test")).to.be.true;
      expect(result.profiles.get("test")).to.deep.equal({ key1: "value1", key2: "value2" });

      // Services
      expect(result.services.has("test")).to.be.true;
      expect(result.services.get("test")).to.deep.equal(["service1", "service2"]);

      // SSO Sessions
      expect(result.ssoSessions.has("test")).to.be.true;
      expect(result.ssoSessions.get("test")).to.deep.equal({ ssoKey: "ssoValue" });
    });

    it("should ignore comments in the INI string", () => {
      const iniString = `
        # This is a comment
        [profile test]
        key1 = value1
        ; Another comment
        key2 = value2
      `;
      const result = fromIni(iniString);

      // Profiles
      expect(result.profiles.has("test")).to.be.true;
      expect(result.profiles.get("test")).to.deep.equal({ key1: "value1", key2: "value2" });
    });

    it("should handle empty sections", () => {
      const iniString = `
        [profile empty]
        [services empty]
        [sso-session empty]
      `;
      const result = fromIni(iniString);

      // Profiles
      expect(result.profiles.has("empty")).to.be.true;
      expect(result.profiles.get("empty")).to.deep.equal({});

      // Services
      expect(result.services.has("empty")).to.be.true;
      expect(result.services.get("empty")).to.deep.equal([]);

      // SSO Sessions
      expect(result.ssoSessions.has("empty")).to.be.true;
      expect(result.ssoSessions.get("empty")).to.deep.equal({});
    });
  });

  describe("toIni", () => {
    it("should convert JSON back to an INI string", () => {
      const iniContent = {
        profiles: new Map([["test", { key1: "value1", key2: "value2" }]]),
        services: new Map([["test", ["service1", "service2"]]]),
        ssoSessions: new Map([["test", { ssoKey: "ssoValue" }]]),
      };

      const iniString = toIni(iniContent);

      expect(iniString).to.include("[profile test]");
      expect(iniString).to.include("key1 = value1");
      expect(iniString).to.include("key2 = value2");

      expect(iniString).to.include("[services test]");
      expect(iniString).to.include("service1");
      expect(iniString).to.include("service2");

      expect(iniString).to.include("[sso-session test]");
      expect(iniString).to.include("ssoKey = ssoValue");
    });
  });

  describe("readConfig", () => {
    it("should read and parse an INI file", () => {
      const iniString = `
        [profile test]
        key1 = value1
        key2 = value2
      `;
      fs.writeFileSync("test.ini", iniString);

      const result = fromIni(readConfig("test.ini"));

      // Profiles
      expect(result.profiles.has("test")).to.be.true;
      expect(result.profiles.get("test")).to.deep.equal({ key1: "value1", key2: "value2" });

      fs.unlinkSync("test.ini");
    });
  });
});
