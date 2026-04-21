/** T | null | undefined */
export type Maybe<T> = T | null | undefined;

/** T | null */
export type Nullable<T> = T | null;

/** T | undefined */
export type Optional<T> = T | undefined;

/** Recursively makes all properties optional */
export type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;

/** Recursively makes all properties required */
export type DeepRequired<T> = T extends object ? { [P in keyof T]-?: DeepRequired<T[P]> } : T;

/** Flattens intersection types for readable hover tooltips */
export type Prettify<T> = { [K in keyof T]: T[K] } & {};

/** An array guaranteed to have at least one element */
export type NonEmptyArray<T> = [T, ...T[]];

/** Extracts the resolved type of a Promise */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

/** Makes specific keys of T optional */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/** Makes specific keys of T required */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/** Extracts keys of T whose values are of type V */
export type KeysOfType<T, V> = {
  [K in keyof T]-?: T[K] extends V ? K : never;
}[keyof T];
