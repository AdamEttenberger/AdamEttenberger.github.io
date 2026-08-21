export type EnumLike = Record<string, string | number>;

type EnumName<T extends EnumLike> = Extract<keyof T, string>;

export type EnumValue<
  T extends EnumLike,
  K extends EnumName<T> = EnumName<T>
> = T[K];

export type EnumNameValueEntry<T extends EnumLike> = {
  [K in EnumName<T>]: [K, EnumValue<T, K>]
}[EnumName<T>];

export type EnumValueNameEntry<T extends EnumLike> = {
  [K in EnumName<T>]: [EnumValue<T, K>, K]
}[EnumName<T>];

/**
 * Accumulator callback for `reduce` functionality.
 * Unlike Array.reduce, this consumes an Iterator,
 * so teh enum `name` (key) and `enumType` are provided
 * in place of `currentIndex` and `array`.
 */
type EnumReduceCallback<
  T extends EnumLike,
  U
> = <K extends EnumName<T>>(
  previousValue: U,
  value: EnumValue<T, K>,
  name: K,
  enumType: T,
) => U;

/**
 * Reverse mapped integral values are represented as a string (e.g., "0").
 * @param key The key to test.
 * @returns Returns true if the string is an integral value, false otherwise.
 */
function isReverseMappingArtifactKey(key: string): boolean {
  return key.length > 0 && !Number.isNaN(Number(key));
}

/**
 * For integral enums, is the `value` a string name.
 * @param enumType The `enum` type
 * @param name The name to check validity of
 * @returns True if `name` is a valid string name of `enumType`, false otherwise
 */
export function isEnumName<
  T extends EnumLike
>(
  enumType: T,
  name: unknown
): name is EnumName<T> {
  return typeof name === 'string' &&
         !isReverseMappingArtifactKey(name) &&
         Object.prototype.hasOwnProperty.call(enumType, name);
}

/**
 * For integral enums, iterate over string keys.
 * @param enumType The `enum` type
 * @returns Itereator over the string keys
 */
export function enumNames<
  T extends EnumLike
>(
  enumType: T
): Iterable<EnumName<T>> {
  return {
    *[Symbol.iterator]() {
      for (const name of Object.keys(enumType)) {
        if (isEnumName(enumType, name)) {
          yield name;
        }
      }
    }
  }
}

/**
 * For integral enums, iterate over integral keys.
 * @param enumType The `enum` type
 * @returns Itereator over the integral keys
 */
export function enumValues<
  T extends EnumLike
>(
  enumType: T
): Iterable<EnumValue<T>> {
  return {
      *[Symbol.iterator]() {
      for (const name of enumNames(enumType)) {
        yield enumType[name] as EnumValue<T>;
      }
    }
  };
}

/**
 * For integral enums, returns an "entries" array with string primary keys.
 * @param enumType The `enum` type
 * @returns List of enum entries with string primary keys.
 */
export function enumNameValueEntries<
  T extends EnumLike
>(
  enumType: T
): EnumNameValueEntry<T>[] {
  const result: EnumNameValueEntry<T>[] = [];
  for (const name of enumNames(enumType)) {
    result.push([name, enumType[name]] as EnumNameValueEntry<T>);
  }
  return result;
}

/**
 * For integral enums, returns an "entries" array with integral primary keys.
 * @param enumType The `enum` type
 * @returns List of enum entries with integral primary keys.
 */
export function enumValueNameEntries<
  T extends EnumLike
>(
  enumType: T
): EnumValueNameEntry<T>[] {
  const result: EnumValueNameEntry<T>[] = [];
  for (const name of enumNames(enumType)) {
    result.push([enumType[name], name] as EnumValueNameEntry<T>);
  }
  return result;
}

/**
 * For integral enums, performs the "reduce" transformation for mapping between types.
 * @param enumType The `enum` type
 * @param callbackfn Callback used to aggregate values into the `initialValue`.
 * @param initialValue The container to aggregate values into.
 * @returns The completed transformation.
 */
export function reduceEnum<
  T extends EnumLike,
  U
>(
  enumType: T,
  callbackfn: EnumReduceCallback<T, U>,
  initialValue: U
): U {
  let result = initialValue;
  for (const name of enumNames(enumType)) {
    result = callbackfn(
      result,
      enumType[name] as EnumValue<T>,
      name as EnumName<T>,
      enumType,
    );
  }
  return result;
}
