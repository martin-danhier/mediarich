
import { Duration } from 'date-fns';

/**
 * Similar to Array.find, but supports async functions and wait for Promises to resolve
 * @param array The array to test
 * @param callback The async test callback called on every item
 * @returns the first found item, or null if not found
 */
export async function findAsync<T>(array: T[], callback: (value: T, index: number) => Promise<boolean>): Promise<T | null> {
    // Map the callback to the array to get the array of promises
    const promises = array.map(callback);
    // Wait for all the promises to resolve
    const results = await Promise.all(promises);
    // Find the first that returns a truthy value
    const index = results.findIndex(result => result);
    if (index >= 0) {
        // Return the corresponding item if found
        return array[index];
    } else {
        // Else return null
        return null;
    }
}

/**
 * Creates a Duration object from a string representation
 * @param str format of the duration. The format is {hours} h {minutes} m {seconds} s. The values can be omitted
 * @example "4 h 2 m 25s"
 * @example "5 m 25s"
 * @example "4 h"
 * @example "4s"
 */
export function stringToDuration(str: string): Duration {
    const match = /(?:(?<hours>\d+) *h *)?(?:(?<minutes>\d+) *m *)?(?:(?<seconds>\d+) *s *)?/.exec(str);
    if (match && match.groups) {
        return {
            hours: parseInt(match.groups.hours ?? '0'),
            minutes: parseInt(match.groups.minutes ?? '0'),
            seconds: parseInt(match.groups.seconds ?? '0'),
        };
    } else throw Error('Invalid duration format');
}

/**
 * Creates a string from a duration object
 * @param duration The duration to format
 */
export function formatDuration(duration: Duration): string {
    const hours = duration.hours ? `${duration.hours}h` : '';
    const minutes = duration.minutes ? `${duration.minutes}m` : '';
    const seconds = duration.seconds ? `${duration.seconds}s` : '';
    return [hours, minutes, seconds].join(' ');
}

/** Same as ``string.prototype.toUpper``, but only capitalizes the first letter. */
export function toUpperCaseFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Filters an object, returning another object with only the keys that returned true
 * @param object The object to filter
 * @param callback The call back to call on each value
 */
export function filterObject<T>(object: { [key: string]: T }, callback: (key: string, value: T) => boolean): { [key: string]: T } {
    const obj: Record<string, T> = {};
    for (let key in object) {
        // Call the callback
        const shouldKeep = callback(key, object[key]);
        // Don't add it if false
        if (shouldKeep) {
            obj[key] = object[key];
        }
    }
    return obj;
}


export type MapToObjectCallback<T, V> = (item: T, index: number) => ({ key: string; value: V } | null);
/**
 * Maps an array, but instead of producing another array, produce an object. Also offers filter capabilities if the callback returns null.
 * @param array The array of which to map the value
 * @param callback The callback to call on each value
 */
export function mapToObject<T, V>(array: T[], callback: MapToObjectCallback<T, V>): { [key: string]: V } {

    const obj: Record<string, V> = {};

    for (let i = 0; i < array.length; i++) {
        // Call the callback
        const result = callback(array[i], i);
        // Add it to the object if not null
        if (result) {
            obj[result.key] = result.value;
        }
    }
    return obj;
}