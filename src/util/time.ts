/**
 * @param value the number of frames per second requested.
 * @returns milliseconds between frames at `fps`.
 */
export function fps(value: number): number {
  return 1000.0 / value;
}