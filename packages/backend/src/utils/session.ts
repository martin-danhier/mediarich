import { SessionOptions, Store } from 'express-session';
import SequelizeStoreInit from 'connect-session-sequelize';
import { Sequelize } from 'sequelize-typescript';
import { User } from '../models';

// Inject the user field in the session data type
declare module 'express-session' {
    interface SessionData {
        user: User,
    }
}

// Init the store class
export const SequelizeStore = SequelizeStoreInit(Store);

export function getSessionOptions(sequelize: Sequelize): SessionOptions {
    // Init store
    const store = new SequelizeStore({
        db: sequelize,
        table: 'Session',
        extendDefaultFields: (defaults, session) => {
            return {
                data: defaults.data,
                expires: defaults.expires,
                userId: session.user.uuid,
            };
        },

    });

    // Init session options
    const options: SessionOptions = {
        secret: process.env.SECRET_KEY ?? 'SET SECRET_KEY VARIABLE IN PRODUCTION',
        resave: false,
        saveUninitialized: false,
        // Init sequelize store
        store,
        cookie: {
            sameSite: 'strict',
            secure: 'auto',
        },
    };

    // Sync the database
    store.sync();

    return options;
}