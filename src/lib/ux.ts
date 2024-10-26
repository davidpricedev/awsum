import boxen from "boxen";
import Table from "cli-table";
import enquirer from "enquirer";
import JSONChalkify from "json-chalkify";
import readline from "node:readline/promises";

const chalkifier = () => new JSONChalkify().chalkify;

export const prettyJson = (jsonObj: object) => chalkifier()(jsonObj);

export const showChoicePrompt = async (question: string, choices: string[]): Promise<string> => {
  const choiceQuestion = {
    choices,
    message: question,
    name: "decision",
    type: "select",
  };
  const result = await enquirer.prompt(choiceQuestion);
  return (result as any).decision;
};

// similar to showChoicePrompt, but allows typing to filter choices
export const showAutocompletePrompt = async (
  question: string,
  choices: string[],
): Promise<string> => {
  const choiceQuestion = {
    choices,
    message: question,
    name: "decision",
    type: "autocomplete",
  };
  const result = await enquirer.prompt(choiceQuestion);
  return (result as any).decision;
};

export const waitForEnter = async (message: string): Promise<void> => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  await rl.question(message);
};

/**
 * Shows a vertical table with keys as the first column and values as the second column.
 */
export const verticalTable = (data: any[]) => {
  const table = new Table();
  table.push(...data);
  return table.toString();
};

/**
 * More complex table with headers and rows
 * @param rowNameResolver - resolver function to extract the row name from a data entry
 * @param data - array of row data entries
 * @param headers - optional array of header names (if not provided, the keys of the first entry are used)
 */
export const prettyTable = (
  rowNameResolver: (entry: any) => string,
  data: any[],
  headers?: string[],
) => {
  const headerRow = headers ?? Object.keys(data[0]);
  const table = new Table({ head: ["", ...headerRow] });
  const tableRows = data.map((entry) => {
    const key = rowNameResolver(entry);
    const rowData = headerRow.map((x) => entry[x]);
    return { [key]: rowData };
  });
  table.push(...tableRows);
  return table.toString();
};

export const infoBox = (message: string) =>
  boxen(message, { borderColor: "blue", margin: 1, padding: 1, title: "info" });
