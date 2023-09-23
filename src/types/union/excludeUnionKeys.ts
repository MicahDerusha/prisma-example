/**
 * T is the source union type
 * U is the ignoreString
 * returns the input union type, excluding any strings that contain the ignoreString
 */
export type ExcludeUnionKeys<
  T extends string,
  U extends string
> = T extends `${infer Prefix}${U}` ? never : T;
