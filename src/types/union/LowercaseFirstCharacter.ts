export type LowercaseFirstCharacter<T extends string> =
  T extends `${infer First}${infer Rest}`
    ? `${Lowercase<First>}${Rest}`
    : Lowercase<T>;
