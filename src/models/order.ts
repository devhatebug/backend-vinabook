import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

interface OrderInstance {
  id: string;
  idBook: string;
  nameClient: string;
  phoneNumber: string;
  address: string;
  note: string;
  status: "pending" | "completed" | "canceled" | "processing";
  quantity: number;
}

class Order extends Model<OrderInstance> implements OrderInstance {
  public id!: string;
  public idBook!: string;
  public nameClient!: string;
  public phoneNumber!: string;
  public address!: string;
  public note!: string;
  public status!: "pending" | "completed" | "canceled" | "processing";
  public quantity!: number;
}

Order.init(
  {
    id: {
      type: DataTypes.UUIDV4,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    idBook: {
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
      type: DataTypes.ENUM("pending", "completed", "canceled", "processing"),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    tableName: "order",
    timestamps: false,
  }
);

export default Order;
