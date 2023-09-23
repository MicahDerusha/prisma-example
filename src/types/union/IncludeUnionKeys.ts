/**
 * T is the source union type
 * U is the ignoreString
 * returns the input union type, including any strings that contain the ignoreString
 */
export type IncludeUnionKeys<
  T extends string,
  U extends string
> = T extends `${infer Prefix}${U}` ? T : never;
