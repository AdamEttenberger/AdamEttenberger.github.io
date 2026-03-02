export function bit_width(value: number): number {
  if (value == 0) {
    return 0;
  }
  return 1 + Math.floor(Math.log2(value));
}

export function bit_ceil(value: number): number {
  const width = bit_width(value);
  if (width == 0) {
    return 0;
  }
  return 1 << (width - 1);
}
