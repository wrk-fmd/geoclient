// TODO UNIX timestamp would be easier to handle, maybe change API?
export type ApiTimestamp = string;

/**
 * Formats a JS timestamp for sending to the API
 * @param jsTimestamp A JS timestamp, i.e. milliseconds since epoch
 */
export function toApiTimestamp(jsTimestamp: number): ApiTimestamp {
  return new Date(jsTimestamp).toISOString();
}

/**
 * Calculates the age of an API timestamp in milliseconds
 * @param timestamp An API timestamp
 * @return The age in milliseconds, or {@link Infinity} if no timestamp is given
 */
export function timestampAge(timestamp?: ApiTimestamp): number {
  return timestamp !== undefined
    ? Date.now() - fromApiTimestamp(timestamp)
    : Infinity;
}

/**
 * Transforms an API timestamp into a JS timestamp
 * @param timestamp An API timestamp
 * @return A JS timestamp, i.e. milliseconds since epoch
 */
export function fromApiTimestamp(timestamp: ApiTimestamp): number {
  return +(new Date(timestamp));
}
