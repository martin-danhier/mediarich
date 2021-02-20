import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils';

/** Logs any received request using the custom logger */
export function logger(req: Request, res: Response, next: NextFunction): void {
    // Register a log when the response is sent
    res.on('finish', () => {
        Logger.logRequest(req, res);
    });

    next();
}