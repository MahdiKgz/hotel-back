const { Sequelize } = require("sequelize");
require("dotenv").config();

const app = require("./app");

async function connectToDb() {
  try {
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
  } catch {
    throw new Error(
      "Something gone wrong while trying to connect DB. check the options",
    );
  }
}

async function initServer() {
  try {
    const port = process.env.PORT || 3000;

    app.listen(port, () => {
      console.log(
        `Listening on port ${port} on ${process.env.NODE_ENV === "production" ? "production" : "development"} mode`,
      );
    });
  } catch (err) {
    throw new Error("Error while starting Server. check the logs : ", err);
  }
}

async function run() {
  await connectToDb();
  await initServer();
}

run();
