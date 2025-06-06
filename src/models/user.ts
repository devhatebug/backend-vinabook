import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export interface UserInstance {
    id: string;
    email: string;
    username: string;
    password: string;
    role: 'admin' | 'user';
}

class User extends Model<UserInstance> implements UserInstance {
    public id!: string;
    public email!: string;
    public username!: string;
    public password!: string;
    public role!: 'admin' | 'user';
}

User.init(
    {
        id: {
            type: DataTypes.UUIDV4,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM('admin', 'user'),
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'user',
        timestamps: false,
    }
);

export default User;
