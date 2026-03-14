const { Sequelize } = require("sequelize");

const dbConfigs = new Sequelize({
  database: process.env.MYSQL_DATABASE_NAME,
  host: process.env.MYSQL_HOST,
  username: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_DATABASE_PASSWORD || "",
  dialect: "mysql",

  logging: process.env.NODE_ENV === "production" ? false : console.log,
});

dbConfigs
  .authenticate()
  .then(() => {
    console.log("Connected To Database Successfully !!");
  })
  .catch((err) => {
    console.log("Error While trying to connect DB : ", err);
  });

module.exports = dbConfigs;
