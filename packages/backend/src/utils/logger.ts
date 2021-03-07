/**
 * @file Custom logger for the backend
 * @author Martin Danhier
 * @license Apache
* @version 1.0
 */

import { yellow, gray, blueBright, redBright, bold, green, Chalk } from 'chalk';
import { Request, Response } from 'express';

/**
 * Logs levels for the Logger
 */
export enum LogLevel {
    /** Show all logs */
    All = 6,
    /** Show more logs, but not the details of the inner workings of the code (e.g database logs) */
    Log = 5,
    /** Only show errors, warnings, infos and request logs */
    Requests = 4,
    /** Only show errors, warnings and infos */
    Info = 3,
    /** Only show errors and warnings */
    Warn = 2,
    /** Only show errors */
    Error = 1,
    /** Don't show any log */
    None = 0,
}

/** Wrapper around console to provide more tools for logging.
 * These tools include a log level management and coloring.
 */
export class Logger {
    static logLevel: LogLevel = LogLevel.Log;

    /** Other log. Is displayed in gray.
     *
     * Minimum level: All
     */
    static otherLog(header: string, message: string): void {
        Logger.baseLog(message, header, LogLevel.All, gray);
    }

    /** Verbose info log. Displays in normal white.
     *
     * Minimum level: Log
     */
    static log(message: string): void {
        Logger.baseLog(message, 'LOG', LogLevel.Log);
    }

    /**
     * Logs an HTTP request
     * @param req Request to log
     * @param res Response to log
     * @param message Custom message to put at the end
     */
    static logRequest(req: Request, res: Response, message?: string): void {
        if (Logger.logLevel >= LogLevel.Requests) {

            let logMsg = `${green(req.method)} ${req.originalUrl}`;

            // Create response log
            let resMsg = `${res.statusCode}: ${res.statusMessage}`;
            // Color in red if error
            if (res.statusCode >= 400) {
                resMsg = redBright(resMsg);
            }

            logMsg += ' -> ' + resMsg;

            if (message) {
                logMsg += ': ' + message;
            }

            Logger.baseLog(logMsg, 'REQUEST');
        }
    }

    /** General info log. The INFO text is displayed in blue.
     *
     * Minimum level: Info
     */
    static info(message: string): void {
        Logger.baseLog(bold(message), blueBright('INFO'), LogLevel.Info);
    }

    /** Warning log. The whole text is displayed in yellow.
     *
     * Minimum level: Warn
     */
    static warn(message: string): void {
        Logger.baseLog(message, 'WARNING', LogLevel.Warn, yellow);
    }

    /** Error log. The whole text is displayed in red.
     *
     * Minimum level: Error
     */
    static error(message: string): void {
        Logger.baseLog(message, 'ERROR', LogLevel.Error, redBright);
    }

    /** Handle the common log logic.
     * @param message The message to display
     * @param header The text displayed between the brackets
     * @param minLevel The minimum log level required to display the message
     * @param color The color to eventually apply to the whole text
     */
    static baseLog(message: string, header: string, minLevel?: LogLevel, color?: Chalk): void {
        // Check if the level is reached
        if (minLevel === undefined || Logger.logLevel >= minLevel) {

            // Create base message
            const now = new Date();
            const dateString = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} at ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
            let msg = `[${header}] ${dateString} - ${message}`;

            // Apply color if needed
            if (color) {
                msg = color(msg);
            }

            // Display the message
            console.log(msg);
        }
    }

    /** Inits the log level from the ``LOG_LEVEL`` env variable.
     *
     * The variable must contain a number representing the level in the LogLevel enum.
     */
    static initLevel(): void {
        // Init logger
        try {
            // Get the value of the env variable
            const level = process.env.LOG_LEVEL;
            if (level) {
                // Try to parse it as an int
                const intLevel = parseInt(level);
                // Check if it exists in the enum
                if (Object.values(LogLevel).includes(intLevel)) {
                    Logger.logLevel = intLevel;
                    return;
                }
            }
            // Else fallback to a Log level
            Logger.logLevel = LogLevel.Log;
        } catch {
            // Same if the parsing failed
            Logger.logLevel = LogLevel.Log;
        }
    }

}