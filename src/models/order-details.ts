import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface OrderDetailsInstance {
    id: string;
    orderId: string;
    bookId: string;
    quantity: number;
    price: number;
}

class OrderDetails
    extends Model<OrderDetailsInstance>
    implements OrderDetailsInstance
{
    public id!: string;
    public orderId!: string;
    public bookId!: string;
    public quantity!: number;
    public price!: number;
}

OrderDetails.init(
    {
        id: {
            type: DataTypes.UUIDV4,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        orderId: {
            type: DataTypes.UUIDV4,
            allowNull: false,
        },
        bookId: {
            type: DataTypes.UUIDV4,
            allowNull: false,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'order_details',
        timestamps: false,
    }
);

export default OrderDetails;
