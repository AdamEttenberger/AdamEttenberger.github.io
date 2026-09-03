export function alignUp(
  value: number,
  alignment: number,
): number {
  return Math.ceil(value / alignment) * alignment;
}
