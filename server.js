require("dotenv").config();
require("./redis");

const app = require("./app");
const db = require("./configs/db");
const Province = require("./models/v1/Province.model");
const seedProvinces = require("./utils/seedProvinces");

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
  try {
    db.sync({ alter: true });
    await Province.sync({ force: true });
    await seedProvinces();
    await initServer();
  } catch {
    db.sync({ force: true });
    Province.sync({ force: true });
  }
}

run();
