import sequelize from '../config/database';
import { DataTypes, Model } from 'sequelize';

export interface PointPurchaseAttributes {
    id: string;
    userId: string;
    point: number;
}

export class PointPurchase
    extends Model<PointPurchaseAttributes>
    implements PointPurchaseAttributes
{
    public id!: string;
    public userId!: string;
    public point!: number;
}

PointPurchase.init(
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
        point: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'POINT_PURCHASE',
        timestamps: false,
    }
);

export default PointPurchase;
