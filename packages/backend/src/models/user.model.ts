import { Model, Column, Table, PrimaryKey, Unique } from 'sequelize-typescript';

@Table
export class User extends Model {

    @PrimaryKey
    @Column
    uuid!: string;

    @Unique
    @Column
    username!: string;

    @Column
    passwordHash!: string;

    @Column
    apiKey!: string;

}