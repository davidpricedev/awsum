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

      expect(result.profiles).to.have.property("test");
      expect(result.profiles.test).to.deep.equal({ key1: "value1", key2: "value2" });

      expect(result.services).to.have.property("test");
      expect(result.services.test).to.deep.equal(["service1", "service2"]);

      expect(result.ssoSessions).to.have.property("test");
      expect(result.ssoSessions.test).to.deep.equal({ ssoKey: "ssoValue" });
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

      expect(result.profiles).to.have.property("test");
      expect(result.profiles.test).to.deep.equal({ key1: "value1", key2: "value2" });
    });

    it("should handle empty sections gracefully", () => {
      const iniString = `
        [profile test]
        [services test]
        [sso-session test]
      `;
      const result = fromIni(iniString);

      expect(result.profiles).to.have.property("test");
      expect(result.profiles.test).to.deep.equal({});

      expect(result.services).to.have.property("test");
      expect(result.services.test).to.deep.equal([]);

      expect(result.ssoSessions).to.have.property("test");
      expect(result.ssoSessions.test).to.deep.equal({});
    });
  });

  describe("toIni", () => {
    it("should convert JSON back to an INI string", () => {
      const json = {
        profiles: {
          test: { key1: "value1", key2: "value2" },
        },
        services: {
          test: ["service1", "service2"],
        },
        ssoSessions: {
          test: { ssoKey: "ssoValue" },
        },
      };
      const iniString = toIni(json);

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
    it("should return an empty string if the file does not exist", () => {
      const filePath = "nonexistent-file.ini";
      const result = readConfig(filePath);

      expect(result).to.equal("");
    });

    it("should read the content of an existing file", () => {
      const filePath = "test.ini";
      const fileContent = "[profile test]\nkey1 = value1\n";
      fs.writeFileSync(filePath, fileContent);

      const result = readConfig(filePath);

      expect(result).to.equal(fileContent);

      fs.unlinkSync(filePath); // Clean up
    });
  });
});
