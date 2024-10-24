import { execCommand, spawnCommand } from "./shell.js";

interface PortForwardingParams {
  bastionInstance: string;
  endpoint: string;
  localPort: number;
  region: string;
  targetPort: number;
}

export const startPortForwarding = ({
  bastionInstance,
  endpoint,
  localPort,
  region,
  targetPort,
}: PortForwardingParams) => {
  const cmdParts = [
    "ssm",
    "start-session",
    "--region",
    region,
    "--target",
    bastionInstance,
    "--document-name",
    "AWS-StartPortForwardingSessionToRemoteHost",
    "--parameters",
    `{"host":["${endpoint}"],"portNumber":["${targetPort}"],"localPortNumber":["${localPort}"]}`,
  ];
  return spawnCommand("aws", cmdParts);
};

export const ensureSessionManagerPlugin = () => {
  const output = execCommand("which session-manager-plugin");
  if (!output) {
    console.error(
      "Session Manager Plugin not found. See: https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-install-plugin.html"
    );
  }
};
