/**
 * @file Definition of the Session table of the database, for use with Express session
 * @author Martin Danhier
 * @license Apache
 * @version 1.0
 */

import { Model, Column, Table, PrimaryKey, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './user.model';

/**
 * Definition of the Session table of the database
 */
@Table
export class Session extends Model {
    /** The session id */
    @PrimaryKey
    @Column(DataType.STRING)
    sid!: string;

    /** Expiration date of the session */
    @Column
    expires!: Date;

    /** Data json of the session */
    @Column(DataType.TEXT)
    data!: string;

    /** Foreign key to the linked User */
    @ForeignKey(() => User)
    @Column
    userId!: string;

    /** User linked to this session.
     * This is not a column, but a shortcut property provided by sequelize. */
    @BelongsTo(() => User)
    user!: User | undefined;
}