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