import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

interface ContactInstance {
  id: string;
  name: string;
  phone: string;
  message: string;
}

class Contact extends Model<ContactInstance> implements ContactInstance {
  public id!: string;
  public name!: string;
  public phone!: string;
  public message!: string;
}

Contact.init(
  {
    id: {
      type: DataTypes.UUIDV4,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "contact",
    timestamps: false,
  },
);

export default Contact;
