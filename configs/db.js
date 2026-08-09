const { Sequelize } = require("sequelize");

const dbConfigs = new Sequelize({
  database: process.env.MYSQL_DATABASE_NAME,
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT || 3306),
  username: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_DATABASE_PASSWORD || 'root',
  dialect: "mysql",
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },

  // logging: process.env.NODE_ENV === "production" ? false : console.log,
  logging: false,
});

module.exports = dbConfigs;
