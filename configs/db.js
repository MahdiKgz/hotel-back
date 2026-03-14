const { Sequelize } = require("sequelize");

const dbConfigs = new Sequelize({
  database: "hotel",
  host: "localhost",
  username: "root",
  password: "",
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
