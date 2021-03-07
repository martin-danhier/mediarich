/**
 * @file Definition of the User table of the database
 * @author Martin Danhier
 * @version 1.0
 */

import { Model, Column, Table, PrimaryKey, Unique } from 'sequelize-typescript';

/**
 * Definition of the User table of the database
 */
@Table
export class User extends Model {

    /** uuid of the user */
    @PrimaryKey
    @Column
    uuid!: string;

    /** Username of the user */
    @Unique
    @Column
    username!: string;

    /** Hash of the password of the user */
    @Column
    passwordHash!: string;

    /** API key of the user */
    @Column
    apiKey!: string;

}