import { Sequelize } from "sequelize";
import { config } from "./dotenv";

const sequelize = new Sequelize(
  config.db.name,
  config.db.user,
  config.db.pass,
  {
    host: config.db.host,
    dialect: "mysql",
  },
);

export default sequelize;
