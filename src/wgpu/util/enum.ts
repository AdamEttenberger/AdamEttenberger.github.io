export type EnumLike = Record<string, string | number>;

export type EnumName<T extends EnumLike> =
  Extract<keyof T, string>;

export type EnumValue<T extends EnumLike> =
  Extract<keyof T, number>;

export type EnumForward<T extends EnumLike> = {
  [K in EnumName<T>]: EnumValue<T>
};

export type EnumReverse<T extends EnumLike> = {
  [K in EnumValue<T>]: EnumName<T>
};

export type EnumNameValueEntry<T extends EnumLike> = {
  [K in EnumName<T>]: [K, T[K]]
}[EnumName<T>];

export type EnumValueNameEntry<T extends EnumLike> = {
  [K in EnumValue<T>]: [K, T[K]]
}[EnumValue<T>];

type EnumReduceValueNameCallback<
  T extends EnumLike,
  U
> = <K extends EnumValue<T>>(
  previousValue: U,
  value: K,
  name: T[K],
) => U;

/**
 * For any enum, is the `key` (string|number) is valid for `enumType`.
 * @param enumType The `enum` type
 * @param key The key to check validity of
 * @returns True if `key` is valid for `enumType`, false otherwise
 */
export function isEnumKey<
  T extends EnumLike
>(
  enumType: T,
  key: unknown
) : key is keyof T {
  return (typeof key === 'string' || typeof key === 'number') &&
         enumType[key] !== undefined;
}

/**
 * For integral enums, is the `value` an integral value.
 * @param enumType The `enum` type
 * @param key The key to check validity of
 * @returns True if `value` is a valid integral key of `enumType`, false otherwise
 */
export function isEnumValue<
T extends EnumLike
>(
  enumType: T,
  key: unknown
): key is EnumValue<T> {
  return Number.isInteger(key) &&
         enumType[key as number] !== undefined;
}

/**
 * For integral enums, is the `value` a string name.
 * @param enumType The `enum` type
 * @param key The key to check validity of
 * @returns True if `value` is a valid string key of `enumType`, false otherwise
 */
export function isEnumName<
  T extends EnumLike
>(
  enumType: T,
  key: unknown
): key is EnumName<T> {
  return typeof key === 'string' &&
         enumType[key] !== undefined &&
         Number.isInteger(enumType[key]);
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
      for (const value of Object.values(enumType)) {
        if (isEnumValue(enumType, value)) {
          yield value;
        }
      }
    }
  };
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
      for (const value of Object.values(enumType)) {
        if (isEnumName(enumType, value)) {
          yield value;
        }
      }
    }
  }
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
  for (const keyName of enumNames(enumType)) {
    result.push([
      keyName,
      enumType[keyName],
    ]);
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
  for (const value of enumValues(enumType)) {
    result.push([
      value,
      enumType[value],
    ]);
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
  callbackfn: EnumReduceValueNameCallback<T, U>,
  initialValue: U
): U {
  let result = initialValue;
  for (const value of enumValues(enumType)) {
    result = callbackfn(result, value, enumType[value]);
  }
  return result;
}
