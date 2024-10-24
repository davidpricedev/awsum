import {
  ListAccountRolesCommand,
  ListAccountsCommand,
  SSOClient,
} from "@aws-sdk/client-sso";
import {
  CreateTokenCommand,
  RegisterClientCommand,
  SSOOIDCClient,
  StartDeviceAuthorizationCommand,
} from "@aws-sdk/client-sso-oidc";

import { RoleInfo } from "./aws-config.js";

export const grantType = "urn:ietf:params:oauth:grant-type:device_code";
export const clientRegistrationType = "public";

export const getSsoClient = () => new SSOClient({});

export const getSsoOidcClient = () => new SSOOIDCClient({});

/**
 * Creates a "client" in sso-oidc. The first step in sso authentication
 */
export const registerClient = async (hostname: string) => {
  const client = getSsoOidcClient();
  const clientName = `botocore-client-${hostname}-${Date.now()}`;
  const input = {
    clientName,
    clientType: clientRegistrationType,
  };
  const command = new RegisterClientCommand(input);
  const response = await client.send(command);
  return response;
};

/**
 * Starts the device authorization flow. The second step in sso authentication
 * This step returns the url to open in an external browser as well as the device code
 */
export const startDeviceAuthorization = async (
  clientId: string,
  clientSecret: string,
  startUrl: string
) => {
  const client = getSsoOidcClient();
  const command = new StartDeviceAuthorizationCommand({
    clientId,
    clientSecret,
    startUrl,
  });
  const response = await client.send(command);
  return response;
};

/**
 * Third step in sso authentication. Requires the approval of the device code via external browser first
 * This step returns an access token that can be used to make authenticated requests
 */
export const createToken = async (
  clientId: string,
  clientSecret: string,
  deviceCode: string
) => {
  const client = getSsoOidcClient();
  const command = new CreateTokenCommand({
    clientId,
    clientSecret,
    deviceCode,
    grantType,
  });
  const response = await client.send(command);
  return response;
};

export const getAccounts = async (accessToken: string) => {
  const ssoClient = getSsoClient();
  const command = new ListAccountsCommand({ accessToken });
  const response = await ssoClient.send(command);
  return response;
};

export const getRoles = async (accessToken: string, accountId: string) => {
  const ssoClient = getSsoClient();
  const command = new ListAccountRolesCommand({ accessToken, accountId });
  const response = await ssoClient.send(command);
  return response;
};

export const fetchAccountsAndRoles = async (
  accessToken: string
): Promise<RoleInfo[]> => {
  const accounts = (await getAccounts(accessToken ?? "")).accountList ?? [];
  console.log(`found ${accounts.length} accounts`);

  const accountsWithRoles = [];
  for (const account of accounts) {
    // Intentionally not parallelizing this to reduce chance of rate limiting
    const roles =
      // eslint-disable-next-line no-await-in-loop
      (await getRoles(accessToken ?? "", account.accountId ?? "")).roleList ??
      [];
    console.log(`found ${roles.length} roles in account ${account.accountId}`);
    accountsWithRoles.push({ ...account, roles });
  }

  console.log("accountAndRoles", JSON.stringify(accountsWithRoles));
  return accountsWithRoles.flatMap((account: any) =>
    account.roles.map((role: any) => ({
      accountId: account.accountId,
      accountName: account.accountName,
      profileName: `${account.accountName}.${role.roleName}`,
      roleName: role.roleName,
    }))
  );
};
