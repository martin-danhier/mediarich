import { Model, Column, Table, PrimaryKey, Unique, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './user.model';

@Table
export class Session extends Model {
    @PrimaryKey
    @Column(DataType.STRING)
    sid!: string;

    @Column
    expires!: Date;

    @Column(DataType.TEXT)
    data!: string;

    @ForeignKey(() => User)
    @Column
    userId!: string;

    @BelongsTo(() => User)
    user!: User | undefined;
}