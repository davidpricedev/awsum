/**
 * Find smallest indent across a multi-line string
 */
export const minIndent = (text: string) => {
  const match = text.match(/^[\t ]*(?=\S)/gm);
  if (!match) {
    return 0;
  }

  return match.reduce((r: any, a: any) => Math.min(r, a.length), Number.POSITIVE_INFINITY);
};

/**
 * Remove indent from a multi-line string
 */
export const stripIndent = (text: string) => {
  const indent = minIndent(text);
  if (indent === 0) {
    return text;
  }

  const regex = new RegExp(`^[ \\t]{${indent}}`, "gm");
  return text.replace(regex, "");
};
