import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import Book from "./book";
import User from "./user";

export interface CartAttributes {
  id: string;
  userId: string;
  bookId: string;
  status: string;
  quantity: number;
}

class Cart extends Model<CartAttributes> implements CartAttributes {
  public id!: string;
  public userId!: string;
  public bookId!: string;
  public status!: string;
  public quantity!: number;
}

Cart.init(
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
      references: {
        model: "user",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    bookId: {
      type: DataTypes.UUIDV4,
      allowNull: false,
      references: {
        model: "book",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    status: {
      type: DataTypes.ENUM("pending", "completed"),
      allowNull: false,
      defaultValue: "pending",
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    tableName: "cart",
    timestamps: false,
  }
);

Cart.belongsTo(Book, {
  foreignKey: "bookId",
  as: "book",
});

Cart.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

export default Cart;
