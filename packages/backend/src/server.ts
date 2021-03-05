import express from 'express';
import { json as jsonParser } from 'body-parser';
import { Logger, initDatabase } from './utils';
import { UserRouter } from './routers';
import { ContentTypeCheckMiddleware, ErrorHandlerMiddleware, LoggerMiddleware } from './middlewares';
import session, { SessionOptions } from 'express-session';
import { getSessionOptions } from './utils';
import { Sequelize } from 'sequelize-typescript';
import cors from 'cors';
import { ok, strictEqual } from 'assert';

/**
 * Singleton class containing various methods to init and handle the server.
 * 
 * Call either `initServer` or `initServerForTesting` before anything else.
 */
export default class Server {
    // Define singleton instance
    private static instance: Server | undefined;

    // Define fields
    private app?: express.Application;
    private database?: Sequelize;
    private sessionOptions?: SessionOptions;

    private constructor() {
        // These are left undefined because constructors can't be async
        this.app = undefined;
        this.database = undefined;
        this.sessionOptions = undefined;
    }

    /**
     * Setups the server instance
     * @async
     */
    private async init(): Promise<void> {
        // Assert that the server is not already initialized
        strictEqual(this.app, undefined, 'The server is already initialized');

        // Init logger
        Logger.initLevel();

        // Create new express app
        this.app = express();
        // Create database
        this.database = await initDatabase();
        // Create session options
        this.sessionOptions = getSessionOptions(this.database);

        // Apply middlewares

        // Logger: log each request
        this.app.use(LoggerMiddleware);
        // Cors
        this.app.use(cors({
            origin: [
                'http://localhost:3000',
                'http://localhost:5000',
                'http://127.0.0.1:3000'
            ],
            exposedHeaders: [
                'Set-Cookie'
            ],

            credentials: true,
            methods: ['GET', 'POST'],
        }));
        // Session: used for authentication
        this.app.use(session(this.sessionOptions));
        // Only accept JSON content types on post requests
        this.app.use(ContentTypeCheckMiddleware([
            'application/json',
            'application/json; charset=utf-8'
        ]));
        // Json parser: parses the body
        this.app.use(jsonParser());
        // Error handler: catches errors thrown by other middlewares
        this.app.use(ErrorHandlerMiddleware);

        // Register routers
        this.app.use('/user', UserRouter);

        // Register 404 route
        this.app.use((req, res) => {
            res.status(404).send({
                error: true,
                cause: 'Route not found'
            });
        });
    }

    /** Starts the server instance to the port stored in the env variable `SERVER_PORT`
     * @throws AssertionError if the `app` field is not defined (init must be called first)
    */
    public listen(): void {
        // Assert that the app is inited
        ok(this.app !== undefined, 'Server not initialized: the "init" function must be called before the "listen" function.');

        // Get the port or set a default one if there isn't any
        const port = process.env.SERVER_PORT ?? '8000';

        // Listen to it
        this.app.listen(port, function () {
            Logger.info(`App is listening on http://localhost:${port} !`);
        });
    }

    /** Returns the express app. The server must be initialized.
     * @throws AssertionError if the server is not initialized (either `initServer` or `initServerForTests` must be called first).
     * @returns the express application
    */
    public static getApp(): express.Application {
        const instance = Server.instance;

        // Assert that the instance exists
        ok(instance !== undefined, 'Server not initialized: the "init" function must be called before the "getApp" function.');
        // Assert that the app is inited
        ok(instance.app !== undefined, 'Server not initialized: the "init" function must be called before the "getApp" function.');

        return instance.app;
    }

    /** Inits and start the server on the port defined in the `SERVER_PORT` env variable.
     * @returns the Server instance
     * @async
    */
    public static async initServer(): Promise<Server> {
        // Assert that we are not in a testing environment
        ok(process.env.NODE_ENV !== 'test', 'Use `initServerForTests` instead of `initServer` when testing.');

        Server.instance = new Server();

        // Init the server
        await Server.instance.init();

        // Start the server
        Server.instance.listen();

        return Server.instance;
    }

    /** Inits the server for testing purposes.
     * @throws AssertionError if `NODE_ENV` is not set to `'test'`.
     * @returns the Server instance
     */
    public static async initServerForTests(): Promise<Server> {
        // Assert that we are in a testing environment
        strictEqual(process.env.NODE_ENV, 'test', 'Use `initServer` instead of `initServerForTests` when not testing.');

        Server.instance = new Server();

        // Init the server
        await Server.instance.init();

        return Server.instance;
    }
}