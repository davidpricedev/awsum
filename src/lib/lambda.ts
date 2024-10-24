import {
  FunctionConfiguration,
  InvokeCommand,
  LambdaClient,
  ListFunctionsCommand,
  LogType,
} from "@aws-sdk/client-lambda";
import fs from "node:fs";

export const listLambdaByPrefix = async (
  prefix: string
): Promise<FunctionConfiguration[]> => {
  const client = new LambdaClient({});
  const result = await client.send(new ListFunctionsCommand({}));
  return (
    result.Functions?.filter((f: FunctionConfiguration) =>
      f.FunctionName?.startsWith(prefix)
    ) || []
  );
};

export const invokeLambda = async (
  functionName: string,
  eventFile: string
): Promise<object> => {
  const client = new LambdaClient({});

  const fileExists = fs.existsSync(eventFile);
  const event = fileExists ? fs.readFileSync(eventFile, "utf8") : "{}";
  const command = new InvokeCommand({
    FunctionName: functionName,
    LogType: LogType.Tail,
    Payload: event,
  });
  const { LogResult: logResult, Payload: payload } = await client.send(command);
  const result = payload ? Buffer.from(payload).toString() : "";
  const logs = logResult ? Buffer.from(logResult, "base64").toString() : "";
  return { logs, result };
};
