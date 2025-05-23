import sequelize from '../config/database';
import { DataTypes, Model } from 'sequelize';

export interface LevelUserAttributes {
    id: string;
    userId: string;
    level: number; // 0: VIP, 1: FAMILIAR, 3: NORMAL
}

export class LevelUser
    extends Model<LevelUserAttributes>
    implements LevelUserAttributes
{
    public id!: string;
    public userId!: string;
    public level!: number; // 0: VIP, 1: FAMILIAR, 3: NORMAL
}

LevelUser.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        level: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'LEVEL_USER',
        timestamps: false,
    }
);

export default LevelUser;
