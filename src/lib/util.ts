/**
 * (ab)use async/await to sleep for a given number of milliseconds
 */
export const sleep = async (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export type objMapFn<InValue, OutValue> = (k: string, v: InValue, i: number) => OutValue;

/**
 * Provide a map function for objects
 */
export const objMap = <I, O>(obj: object, fn: objMapFn<I, O>): object =>
  Object.fromEntries(Object.entries(obj).map(([k, v], i) => [k, fn(k, v, i)]));

export type objFilterFn<T> = (k: string, v: T, i: number) => boolean;

/**
 * Provide a filter function for objects
 */
export const objFilter = <T>(obj: object, fn: objFilterFn<T>): object =>
  Object.fromEntries(Object.entries(obj).filter(([k, v], i) => fn(k, v, i)));

/**
 * Provide a keys function for objects
 */
export const objKeys = (obj: object): string[] => Object.keys(obj);

/**
 * Provide a values function for objects
 */
export const oValues = (obj: object): any[] => Object.values(obj);
