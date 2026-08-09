require("dotenv").config();

const app = require("./app");
const { db } = require("./models");
const redis = require("./redis");
const seedDatabase = require("./seeders");

async function run() {
  try {
    await db.authenticate();
    console.log("Connected to MySQL successfully.");

    await db.sync({
      alter: process.env.DB_SYNC_ALTER === "true",
    });

    if (process.env.AUTO_SEED === "true") {
      await seedDatabase({ closeConnection: false });
    }

    const port = Number(process.env.PORT || 4000);
    const server = app.listen(port, () => {
      console.log("Hotel API listening on http://localhost:" + port);
      console.log("Swagger docs available at http://localhost:" + port + "/docs");
    });

    async function shutdown(signal) {
      console.log(signal + " received. Closing connections...");
      server.close(async () => {
        await Promise.allSettled([db.close(), redis.quit()]);
        process.exit(0);
      });
    }

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    console.error("Server startup failed:", error);
    await Promise.allSettled([db.close(), redis.quit()]);
    process.exitCode = 1;
  }
}

run();
