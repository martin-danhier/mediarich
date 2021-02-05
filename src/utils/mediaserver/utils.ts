import { parse } from 'date-fns';

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

/** Unwraps a value from a type tuple.
 * @param value The value to unwrap
 * @param type The destination type. Can be a string ('number', 'string'...) or a class name
 * @return the value if the type is matching, undefined otherwise
 */
export function as<T extends number | string | boolean | object>(type: Type<T>, value: unknown): T | undefined {
    if ((typeof type === 'string' && typeof value === type)
        || (isTypeClass(type) && value instanceof type)) {
        return value as T;
    }
}

/** Unwraps a value from a type tuple to an enum.\
 * If the value is of the wrong type, or don't exist in the enum,
 * the function will return ``undefined``.
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



export function asDate(value: unknown): Date | undefined {
    if (typeof value === 'string') {
        const date = parse(value, 'yyyy-MM-dd HH:mm:ss', new Date());
        if (!isNaN(date.getTime())) {
            return date;
        }
    }
}