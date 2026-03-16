/**
 * Automatically creates a reverse mapping of the provided `TRecord`.
 * This method only supports `one-to-one` mappings, the enum must have
 * a set of distinct keys and distinct values, however the keys and
 * values may be overlapping sets.
 *
 * Enums with `many-to-one` mappings which have multiple aliases
 * representing the same value are NOT supported:
 * enum Status {
 *   Ok = 'success',
 *   Pass = 'success',
 * }
 *
 * ***
 *
 * Example Usage:
 * ```
 * enum Status {
 *   Ok = 'ok',
 *   Error = 'error',
 * };
 * const StatusKeyLookup: Record<Status, keyof typeof Status> = createInverseRecord(Status);
 * console.log(StatusKeyLookup.ok); // "Ok"
 * ```
 *
 * @param record_type The enum to reverse
 * @returns The enum with keys and values reversed ([k,v] = [v,k]).
 */
export function createInverseRecord<TKey extends number|string|symbol,
                                    TValue extends number|string|symbol>(
  record_type: Record<TKey, TValue>
): Record<TValue, TKey> {
  return (Object.entries(record_type) as [TKey, TValue][])
            .reduce<Record<TValue, TKey>>(
              (aggregate: Record<TValue, TKey>, item: [TKey, TValue]) => {
                aggregate[item[1]] = item[0];
                return aggregate;
              },
              <Record<TValue, TKey>>{}
            );
}
