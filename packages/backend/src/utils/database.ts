import { Sequelize, SequelizeOptions } from 'sequelize-typescript';
import { Session, User } from '../models';
import { Logger } from './logger';

/** Generates a sequelize config object from env variables. */
function sequelizeConfig(): SequelizeOptions {
    return {
        dialect: 'sqlite',
        storage: process.env.DB_PATH ?? (process.env.NODE_ENV == 'test' ? ':memory:' : './__database__/db.sqlite3'),
        models: [User, Session],
        logging: (sql) => Logger.otherLog('DB', sql),
    };
}

/** Inits the sequelize database.
 *
 * @returns the sequelize object
 */
export async function initDatabase(): Promise<Sequelize> {

    // Create database
    const config = sequelizeConfig();
    const sequelize = new Sequelize(config);

    Logger.log(`Initializing database at path "${config.storage}".`);

    // Create the tables if they don't exist yet
    await sequelize.sync();

    

    return sequelize;
}