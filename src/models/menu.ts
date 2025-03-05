import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

interface MenuInstance {
  id: string;
  name: string;
  price: number;
  image: string;
}

class Menu extends Model<MenuInstance> implements MenuInstance {
  public id!: string;
  public name!: string;
  public price!: number;
  public image!: string;
}

Menu.init(
  {
    id: {
      type: DataTypes.UUIDV4,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "menu",
    timestamps: false,
  },
);

export default Menu;
