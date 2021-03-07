/**
 * @file Various types and functions that can be used to safely handle "any" or "unknown" values and type them
 * @version 1.0
 * @author Martin Danhier
 * @license Apache
*/


import { parse } from 'date-fns';
import { JSONInnerObject, JSONInnerObjectContent } from 'utils/api-client';

/** A Type<T> is the representation of the type T\
 * For a string, it will simply be 'string' (used in a typeof)\
 * For an object, it is the constructor function (used in a instanceof)
 */
type Type<T extends number | string | boolean | object> = T extends string ? 'string' :
    T extends number ? 'number' :
    T extends boolean ? 'boolean' :
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new (...a: any) => T;

/**
 * A ClassType<T> is the representation of a class type (not primitive).\
 * It is in fact the constructor function of that class.\
 * However, since T can sometimes be a primitive, we need to tell typescript that this
 * type will only be used when T isn't a primitive (the aim of this type is to tell typescript
 * with the isTypeClass function that when the parameter is a function, the type must be a constructor)
 */
type ClassType<T extends number | string | boolean | object> = T extends string ? never :
    T extends number ? never :
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    T extends boolean ? never : new (...a: any) => T;

/** Check that the type parameter is the representation of a class type. See ClassType */
function isTypeClass<T extends number | string | boolean | object>(type: Type<T>): type is ClassType<T> {
    return typeof type === 'function';
}

/** Check the type of a value at runtime (useful to handle `any` or `unknown` values).
 * The given type can be one of the following:
 * - `'string'`
 * - `'number'`
 * - `'boolean'`
 * - A class name (not in quotes). It must exist at runtime, so it can't be an `interface`, a `type`, or other typescript compile-time types.
 *  */
function runtimeTypeCheck<T extends number | string | boolean | object>(type: Type<T>, value: unknown): value is T {
    return (typeof type === 'string' && typeof value === type)
        || (isTypeClass(type) && value instanceof type);
}

/** Unwraps a value from a type tuple.
 * @param value The value to unwrap
 * @param type The destination type. Can be a string ('number', 'string'...) or a class name
 * @return the value if the type is matching, undefined otherwise
 */
export function as<T extends number | string | boolean | object>(type: Type<T>, value: unknown): T | undefined {
    if (runtimeTypeCheck(type, value)) {
        return value;
    }
}

/**
 * Unwraps a bool from a unknown value that could potentially either a bool or a number
 * @param value The value to unwrap
 * @return the boolean value if the type is number or boolean, undefined otherwise
 *
 * This function exists because the MediaServer API sometimes returns the boolean values as
 * bools (`true` or `false`), and sometimes as numbers (`1` or `0`), even in the same routes with
 * the same parameters.
 */
export function asBool(value: unknown): boolean | undefined {
    if (typeof value === 'boolean') {
        return value;
    } else if (typeof value === 'number') {
        return value === 1;
    }
}

/** Unwraps a value from a type tuple to an enum.\
 * If the value is of the wrong type, or don't exist in the enum,
 * the function will return ``undefined``.
 * 
 * Usage: This function can be used to check a field of an HTTP response and type the values
 * at the same time.
 * 
 * @param enumType The destination enum
 * @param value The value to unwrap
 */
export function asEnum<T extends string | number | null>(
    enumType: { [key: string]: string | number | null },
    value: unknown): T | undefined {
    // Only keep the potential candidate values
    if (typeof value == 'string' || typeof value == 'number' || value === null) {
        // Check if the value exists in the enum's values
        if (Object.values(enumType).includes(value)) {
            // If so, we can safely cast it as the enum
            // Because it is certain that Enum.SomeKey will equal the value
            return value as T;
        }
    }
}


/**
 * Unwraps a value from a type tuple to a Date. If the parameter can be
 * safely converted to a Date (i.e. it's a string and is in a valid format),
 * then the Date is returned. Else, undefined is returned.
 *
 * Usage: This function can be used to check a field of an HTTP response and type the values
 * at the same time.
 *
 * @param value The value to unwrap
 * @param format The requested date format. Other formats won't be accepted.
 *      The default format is `yyyy-MM-dd HH:mm:ss`
 */
export function asDate(value: unknown, format = 'yyyy-MM-dd HH:mm:ss'): Date | undefined {
    if (typeof value === 'string') {
        const date = parse(value, format, new Date());
        if (!isNaN(date.getTime())) {
            return date;
        }
    }
}



/**
 * Unwraps a value to a given array type from an `any`, `unknown`, or type tuple. If the value is the correct type, return it.
 * Else, return `undefined`.
 * 
 * Usage: This function can be used to check a field of an HTTP response and type the values
 * at the same time.
 * 
 * @param type The destination type. Can be a string ('number', 'string'...) or a class name (must exist at runtime).
 * @param value The value to unwrap
 */
export function asArray<T extends number | string | boolean | object>(type: Type<T>, value: unknown): T[] | undefined {
    // First, check if the value is an array
    if (Array.isArray(value)) {
        // If it is, we still don't know if all the values are of the requested type (it's any[])
        // So we runtime type check every value of the array
        if (value.every(elem => runtimeTypeCheck(type, elem))) {
            // Here, value is correctly typed so we can return it instead of undefined.
            return value;
        }
    }
}

/**
 * Unwraps a given JSON value if it matches a JSON object type.
 * @param value The value to unwrap
 * @returns the value if it is an array of objects, else `undefined`
 * @example [{ value: 4}, { other: 4 }] // this is a valid JSON object array, it will be returned.
 * @example 4 // this is not a valid JSON object array, undefined will be returned.
 */
export function asJsonObjectArray(value: JSONInnerObjectContent): JSONInnerObject[] | undefined {
    // First, check if the value is an array
    if (Array.isArray(value)) {
        // Check that all values are objects.
        let valid = true;
        for (const elem of value) {
            if (typeof elem !== 'object' || Array.isArray(elem)) {
                valid = false;
                break; // Don't loop if not needed
            }
        }

        // If "valid" is true, then all elements are JsonInnerObjects
        if (valid) {
            return value as JSONInnerObject[];
        }
    }
}

/** Unwraps a JSON object from a json value.
 * @param value The value to unwrap
 * @returns The value if it is a JSON object, undefined otherwise.
 * @example { value: 4 } // This is a valid JSON object
 */
export function asJsonObject(value: JSONInnerObjectContent): JSONInnerObject | undefined {
    if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
        return value;
    }
}