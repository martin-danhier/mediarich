/**
 * @file Wrapper around the node assert module. It enables to disable assert in production.
 *       In production, the code is minified and dead code is removed. That way, this code is only present in debug mode.
 * @author Martin Danhier
 * @license Apache
* @version 1.0
 */


import assert from 'assert';
// Re export assertion error which doesn't change
export { AssertionError } from 'assert';

// The vanilla 'assert' library is great, but they always stay enabled in production.
// In this project, we often use asserts to test the types of the elements of a list, or other big calculations
// To avoid impacting production performance, this module wraps each assert function in a "if" checking if the NODE_ENV
// variable is not production.
// When building, webpack is configured to remove dead code. Since these "if"s will always have a falsy guard (since the NODE_ENV is given to webpack),
// the conditions are dead code and will be removed. Then, the functions themselves don't contain anything, so they are removed as well and the calls are ignored.
// Even the import statement of this package is ignored since it is useless when all the functions are dead code.

/**
 * A message for an ``AssertionError``.
 */
type Message = string | Error | undefined;


export function ok<T>(value: T, message?: Message): asserts value {
    // Disable in production
    if (process.env.NODE_ENV !== 'production' || process.env.REACT_APP_ENABLE_ASSERTIONS_IN_PRODUCTION === 'true') {
        assert.ok(value, message);
    }
}

export function strictEqual<T>(actual: T, expected: T, message?: Message): asserts actual is T {
    // Disable in production
    if (process.env.NODE_ENV !== 'production' || process.env.REACT_APP_ENABLE_ASSERTIONS_IN_PRODUCTION === 'true') {
        assert.strictEqual<T>(actual, expected, message);
    }
}

export function deepStrictEqual<T>(actual: T, expected: T, message?: Message): asserts actual is T {
    // Disable in production
    if (process.env.NODE_ENV !== 'production' || process.env.REACT_APP_ENABLE_ASSERTIONS_IN_PRODUCTION === 'true') {
        assert.deepStrictEqual<T>(actual, expected, message);
    }
}

export function notStrictEqual<T>(actual: T, expected: T, message: Message): void {
    // Disable in production
    if (process.env.NODE_ENV !== 'production' || process.env.REACT_APP_ENABLE_ASSERTIONS_IN_PRODUCTION === 'true') {
        assert.notStrictEqual(actual, expected, message);
    }
}

export function notDeepStrictEqual<T>(actual: T, expected: T, message?: Message): asserts actual is T {
    // Disable in production
    if (process.env.NODE_ENV !== 'production' || process.env.REACT_APP_ENABLE_ASSERTIONS_IN_PRODUCTION === 'true') {
        assert.notDeepStrictEqual(actual, expected, message);
    }
}

export function ifError<T>(value: T | null | undefined): asserts value is null | undefined {
    // Disable in production
    if (process.env.NODE_ENV !== 'production' || process.env.REACT_APP_ENABLE_ASSERTIONS_IN_PRODUCTION === 'true') {
        assert.ifError(value);
    }
}

export function throws<T>(block: () => T, error?: object | Function | RegExp | Error, message?: Message): void {
    // Disable in production
    if (process.env.NODE_ENV !== 'production' || process.env.REACT_APP_ENABLE_ASSERTIONS_IN_PRODUCTION === 'true') {
        // Original function has two overloads depending on the value of error
        if (error === undefined) {
            assert.throws(block, message);
        }
        else {
            assert.throws(block, error, message);
        }

    }
}

export function doesNotThrow<T>(block: () => T, error?: Function | RegExp, message?: Message): void {
    // Disable in production
    if (process.env.NODE_ENV !== 'production' || process.env.REACT_APP_ENABLE_ASSERTIONS_IN_PRODUCTION === 'true') {
        // Original function has two overloads depending on the value of error
        if (error === undefined) {
            assert.doesNotThrow(block, message);
        } else {
            assert.doesNotThrow(block, error, message);
        }
    }
}


export async function rejects<T>(block: () => Promise<T> | Promise<T>, error?: object | Function | RegExp | Error, message?: Message): Promise<void> {
    // Disable in production
    if (process.env.NODE_ENV !== 'production' || process.env.REACT_APP_ENABLE_ASSERTIONS_IN_PRODUCTION === 'true') {
        // Original function has two overloads depending on the value of error
        if (error === undefined) {
            await assert.rejects(block, message);
        } else {
            await assert.rejects(block, error, message);
        }
    }
}

export async function doesNotReject<T>(block: () => Promise<T> | Promise<T>, error?: Function | RegExp, message?: Message): Promise<void> {
    // Disable in production
    if (process.env.NODE_ENV !== 'production' || process.env.REACT_APP_ENABLE_ASSERTIONS_IN_PRODUCTION === 'true') {
        // Original function has two overloads depending on the value of error
        if (error === undefined) {
            await assert.doesNotReject(block, message);
        } else {
            await assert.doesNotReject(block, error, message);
        }
    }
}

export function fail(message?: Message): never | void {
    // Disable in production
    if (process.env.NODE_ENV !== 'production' || process.env.REACT_APP_ENABLE_ASSERTIONS_IN_PRODUCTION === 'true') {
        assert.fail(message);
    }
}

export default ok;