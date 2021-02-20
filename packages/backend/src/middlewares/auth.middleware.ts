import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils';

/**
 * Checks if the user is connected, and returns an error if they're not
 * @param req Request object
 * @param res Response object
 * @param next Function called to continue execution in other middlewares / routes
 */
export async function auth(req: Request, res: Response, next: NextFunction): Promise<void> {
    // Get the user
    const session = req.session;
    const user = session.user;

    if (user) {
        Logger.log(`Hello user "${user.username}" !`);

        // Store the user object in the request so that the route
        // can access it
        // req.activeUser = user;

        // Proceed
        next();
    } else {
        // Send an error
        res.status(401).send({
            error: true,
            cause: 'Unauthorized'
        });
    }
}