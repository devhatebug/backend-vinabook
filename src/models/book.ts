import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface BookInstance {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  type: 'new' | 'sale';
  label: string;
}

class Book extends Model<BookInstance> implements BookInstance {
  public id!: string;
  public name!: string;
  public price!: number;
  public image!: string;
  public description!: string;
  public type!: 'new' | 'sale';
  public label!: string;
}

Book.init(
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
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('new', 'sale'),
      allowNull: false,
    },
    label: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'book',
    timestamps: false,
  }
);

export default Book;
