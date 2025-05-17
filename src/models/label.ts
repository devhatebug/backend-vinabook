import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

export interface LabelAttributes {
  id: string;
  name: string;
  value: string;
  description: string;
}

class Label extends Model<LabelAttributes> implements LabelAttributes {
  public id!: string;
  public name!: string;
  public value!: string;
  public description!: string;
}

Label.init(
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
    value: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "label",
    timestamps: false,
  }
);

export default Label;
