/**
 *
 */
export type Variadic = unknown[];
export type VariadicFunction<T extends Variadic = [], TReturn = void> = (...args: T) => TReturn;
