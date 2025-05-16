import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface OrderInstance {
    id: string;
    userId: string;
    nameClient: string;
    phoneNumber: string;
    address: string;
    note: string;
    status: 'pending' | 'completed' | 'canceled' | 'processing';
}

class Order extends Model<OrderInstance> implements OrderInstance {
    public id!: string;
    public userId!: string;
    public nameClient!: string;
    public phoneNumber!: string;
    public address!: string;
    public note!: string;
    public status!: 'pending' | 'completed' | 'canceled' | 'processing';
}

Order.init(
    {
        id: {
            type: DataTypes.UUIDV4,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.UUIDV4,
            allowNull: false,
        },
        nameClient: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        phoneNumber: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        note: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM(
                'pending',
                'completed',
                'canceled',
                'processing'
            ),
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'order',
        timestamps: false,
    }
);

export default Order;
