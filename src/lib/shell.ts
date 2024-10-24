import { execSync, spawn } from "node:child_process";

/**
 * Executes a command and returns the stdout as a string
 */
export const execCommand = (command: string): string =>
  execSync(command, { encoding: "utf8" });

/**
 * Spawns a command and relays stdout/stderr
 */
export const spawnCommand = (command: string, args: string[]) => {
  const cmdProc = spawn(command, args);
  cmdProc.stdout.on("data", (data) => {
    console.log("stdout: " + data.toString());
  });

  cmdProc.stderr.on("data", (data) => {
    console.error("stderr: " + data.toString());
  });

  cmdProc.on("exit", (code) => {
    console.log("child process exited with code " + (code ?? -9).toString());
  });
};
