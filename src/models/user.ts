import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

interface UserInstance {
  id: string;
  username: string;
  password: string;
  role: "admin" | "user";
}

class User extends Model<UserInstance> implements UserInstance {
  public id!: string;
  public username!: string;
  public password!: string;
  public role!: "admin" | "user";
}

User.init(
  {
    id: {
      type: DataTypes.UUIDV4,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
      type: DataTypes.ENUM("admin", "user"),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "user",
    timestamps: false,
  }
);

export default User;
