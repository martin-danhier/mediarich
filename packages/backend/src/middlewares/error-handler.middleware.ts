import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils';

/** Catches the errors thrown by other middlewares */
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {

    Logger.error(err.message);

    // Handle bodyparser error
    if (err instanceof SyntaxError) {
        // Send error
        res.status(400).send({
            error: true,
            cause: err.message,
        });
    }
    // Fallback
    else {
        res.status(500).send({
            error: true,
            cause: 'Unknown error',
        });
    }
}