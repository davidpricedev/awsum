import { RDS } from "@aws-sdk/client-rds";

export const getRdsClient = async () => new RDS({});

export const getRdsInstances = async (): Promise<string[]> => {
  const client = await getRdsClient();
  const results = await client.describeDBInstances({});
  return results.DBInstances?.map((x) => x.DBInstanceIdentifier ?? "") ?? [];
};

/**
 * slightly inefficient, to go back to aws for the endpoint since we could technically save it from the initial list above
 */
export const getRdsEndpoints = async (instance: string): Promise<string[]> => {
  const client = await getRdsClient();
  const results = await client.describeDBInstances({
    DBInstanceIdentifier: instance,
  });
  return results.DBInstances?.map((x) => x.Endpoint?.Address ?? "") ?? [];
};
