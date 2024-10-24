/**
 * (ab)use async/await to sleep for a given number of milliseconds
 */
export const sleep = async (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
