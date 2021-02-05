/**
 * @file This module defines advanced typescript types to be able to unleach its power
 */

/**
 * Tuple of N elements.
 * @example Tuple<string, 3> = [string, string, string]
 * @require Typescript 4.1.0
 */
export type Tuple<T, N extends number> = _TupleOf<T, N, []>;

/**
 * Recursive conditional type that creates a tuple of N elements.
 * */
type _TupleOf<T, N extends number, R extends T[]> = R['length'] extends N ? // if the given tuple in R is a long as N (= wanted size)
    R : // Return it
    _TupleOf<T, N, [T, ...R]>; // Else, add a new T at the beginning of R call TupleOf again
    // It will call _TupleOf recursively

