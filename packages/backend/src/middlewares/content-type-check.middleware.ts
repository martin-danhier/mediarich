import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils';

/** Checks if the content type of the request is in the given list */
export function contentTypeCheck(allowedTypes: string[], requiresExplicitType = true) {

    // Return a middleware only allowing the given types in POST requests
    return (req: Request, res: Response, next: NextFunction): void => {
        // Only check POST requests
        if (req.method === 'POST') {
            const type = req.header('Content-Type');

            if (type) {
                // Accepted type ? Ok, continue
                if (allowedTypes.includes(type)) {
                    next();
                }
                // Invalid type
                else {
                    Logger.log(`Invalid content type: "${type}"`);

                    res.status(400).send({
                        error: true,
                        cause: 'Unexpected content type',
                        expected: allowedTypes,
                        found: type,
                    });
                }
            }
            // If types are not required
            else if (!requiresExplicitType) {
                Logger.warn('No explicit content-type given: ignoring.');
            }
            // Else, ask a header
            else {
                Logger.error('No explicit content-type given: rejecting request');

                res.status(400).send({
                    error: true,
                    cause: 'Expected explicit Content-Type header',
                });
            }
        }
        // Ignore if not POST
        else {
            next();
        }
    };

}