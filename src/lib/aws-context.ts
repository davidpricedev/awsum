import { GetCallerIdentityCommand, STSClient } from "@aws-sdk/client-sts";

import { defaultRegion } from "./static.js";

export interface AwsContext {
  account: string;
  awsVars: string[];
  cliRegion: string;
  profile: string;
  sdkRegion: string;
  ssoRole: string;
  userId: string;
}

interface WhoamiOutput {
  account: string;
  arn: string;
  userId: string;
}

export const getStsClient = (): STSClient => new STSClient({});

export const stsWhoami = async (): Promise<WhoamiOutput> => {
  try {
    const {
      Account: account,
      Arn: arn,
      UserId: userId,
    } = await getStsClient().send(new GetCallerIdentityCommand());
    return { account: account ?? "", arn: arn ?? "", userId: userId ?? "" };
  } catch {
    return {
      account: "",
      arn: "",
      userId: "",
    };
  }
};

export const getAwsContext = async (): Promise<AwsContext | undefined> => {
  const cliRegion = process.env.AWS_REGION || "";
  const sdkRegion = process.env.AWS_DEFAULT_REGION || "";
  const profile = process.env.AWS_PROFILE || "";
  const awsVars = getEnvKeysWithPrefix("AWS_");
  try {
    const { account, arn, userId } = await stsWhoami();
    let ssoRole = "";
    if (arn.split("/").length < 2 || arn.split("/")[1].split("_").length < 2) {
      console.warn(
        `Unable to detect an SSO role in the ARN: ${arn}! Maybe you need to login with "aws sso login"?`,
      );
    } else {
      ssoRole = arn.split("/")[1].split("_")[1];
    }

    return {
      account,
      awsVars,
      cliRegion,
      profile,
      sdkRegion,
      ssoRole,
      userId,
    };
  } catch (error) {
    console.error(`Unable to retrieve AWS context:`, error);
  }
};

export const getEnvKeysWithPrefix = (prefix: string): string[] =>
  Object.keys(process.env).filter((key) => key.startsWith(prefix));

export const ensureRegion = (): string => {
  let region = process.env.AWS_REGION;
  if (!region) {
    console.warn(
      `AWS_REGION is not set, please set it to the region you wish to use. Defaulting to ${defaultRegion} for now`,
    );
    region = defaultRegion;
    process.env.AWS_REGION = region;
  }

  return region;
};
