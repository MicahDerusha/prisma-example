/**
 * copies all keys from input obj to output obj, excluding keys that contain the ignoreString
 * @param obj source object
 * @param ignoreString ignores all keys that include the ignoreString
 * @returns
 */
export function includeObjectKeys<
  T extends Record<string, string>,
  U extends string
>(
  obj: T,
  ignoreString: U
): { [K in keyof T as T[K] extends `${string}${U}` ? K : never]: T[K] } {
  const result = {} as {
    [K in keyof T as T[K] extends `${string}${U}` ? K : never]: T[K];
  };
  for (const key in obj) {
    if (key.includes(ignoreString)) {
      //@ts-ignore
      result[key] = obj[key];
    }
  }
  //@ts-ignore
  return result;
}

/**
 * T is the input object
 * U is the include string
 * returns an object type that is identical to the input object's type, excluding all the keys that do not contain the include string.
 * does not provide a human-readable type. prefer to use the function above.
 */
export type IncludeObjectKeys<T, U extends string> = {
  [K in keyof T as T[K] extends `${string}${U}` ? K : never]: T[K];
  // [K in keyof T as T[K] extends `${infer Prefix}${U}` ? never : K]: T[K];
};
