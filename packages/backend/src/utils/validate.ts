/**
 * @file Function to safely handle "any" objects an test if they have the expected values
 * @author Martin Danhier
 * @version 1.0
 */

import { Request, Response } from 'express';

type Schema<T> = {
    [key in keyof T]: T[key] extends boolean ? 'boolean'
    : T[key] extends number ? 'number'
    : T[key] extends string ? 'string'
    : T[key] extends boolean | undefined ? 'boolean?'
    : T[key] extends number | undefined ? 'number?'
    : T[key] extends string | undefined ? 'string?'
    : never;
}

/** Checks if the request body matches the given schema.
 * @returns If so, it returns the body typed with the schema for easy use.
 * Else, it send a response indicating the bad request and returns null.
 */
export function validate<T>(req: Request, res: Response, schema: Schema<T>): T | null {
    const body = req.body;
    const missingKeys = [];
    const badTypeKeys = [];

    // Check each key
    for (const key in schema) {
        // If this is true, then the field can be omitted
        const canBeUndefined = schema[key].endsWith('?');

        // The key is present: type check
        if (key in body) {
            // Type check
            const type = canBeUndefined ? schema[key].substring(0, schema[key].length - 1) : schema[key];

            // If the type is incorrect
            if (!(typeof body[key] === type)) {
                badTypeKeys.push(key);
            }
        }
        // The key is missing
        else if (!canBeUndefined) {
            // Add error if a key is missing and shoudn't be
            missingKeys.push(key);
        }
    }

    // If one missing field or more: bad request
    if (missingKeys.length > 0) {
        res.status(400).send({
            error: true,
            cause: 'Missing fields',
            missing: missingKeys,
        });
        return null;
    }
    // If no field is missing but the types aren't correct
    else if (badTypeKeys.length > 0) {
        res.status(400).send({
            error: true,
            cause: 'Badly typed fields',
            badlyTyped: badTypeKeys.map(key => {
                return {
                    key,
                    found: typeof body[key],
                    expected: schema[key],
                };
            })
        });
        return null;
    }
    // Else return the body
    else {
        return body;
    }
}
