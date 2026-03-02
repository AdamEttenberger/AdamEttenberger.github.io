import { type Variadic, type VariadicFunction } from '@/util/generic'

/**
 * Prevents `callback` from being executed more frequently than `frequency_ms`.
 * When the function is called too frequently, the last unsent message
 * payload is saved to be dispatched once the `frequency_ms` has elapsed.
 * Messages sent during the lockout period are dropped, except the payload
 * of the last message which is automatically dispatched if available.
 *
 * i.e., runs `callback` as when requested as frequently as possible,
 * separated by at least `frequency_ms`, sending the most recent state.
 *
 * @param callback Function to execute.
 * @param frequency_ms Minimum interval between calls.
 * @returns The throttle function wrapper.
 */
export function throttle<T extends Variadic = []>(callback: VariadicFunction<T>, frequency_ms: number): VariadicFunction<T> {
  let handle: undefined|number;
  let next_payload: undefined|T;

  function _run() {
    handle = undefined;
    if (next_payload === undefined) {
      return;
    }
    callback(...next_payload);
    next_payload = undefined;
  }

  return (...args: T): void => {
    next_payload = args;
    if (handle !== undefined) {
      return;
    }
    _run();
    handle = window.setTimeout(_run, frequency_ms);
  }
}

/**
 * Prevents `callback` from being executed until a `timeout` has elapsed
 * since the last time the method was called. When called too frequently,
 * `timeout` is reset and only the last known payload is delivered once
 * `timeout` elapsed.
 *
 * i.e., only run `callback` after being idle for `timeout`, sending the
 * most recent state.
 *
 * @param callback Function to execute.
 * @param timeout Minimum interval to wait before running `callback`.
 * @returns The debounce function wrapper.
 */
export function debounce<T extends Variadic = []>(callback: VariadicFunction<T>, timeout: number): VariadicFunction<T> {
  let handle: undefined|number;
  let next_payload: undefined|T;

  function _run() {
    if (next_payload === undefined) {
      return;
    }
    callback(...next_payload);
    next_payload = undefined;
  }

  return (...args: T): void => {
    next_payload = args;
    clearTimeout(handle);
    handle = window.setTimeout(_run, timeout);
  }
}
