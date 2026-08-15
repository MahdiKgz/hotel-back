require("dotenv").config();

const app = require("./app");
const { db } = require("./models");
const redis = require("./redis");
const seedDatabase = require("./seeders");

async function ensureReservationPrimaryKey() {
  const queryInterface = db.getQueryInterface();
  let columns;
  try {
    columns = await queryInterface.describeTable("Reserves");
  } catch (error) {
    if (error?.original?.code === "ER_NO_SUCH_TABLE") return;
    throw error;
  }

  let indexes = await queryInterface.showIndex("Reserves");
  if (!columns.id) {
    if (indexes.some((index) => index.primary)) {
      await db.query("ALTER TABLE `Reserves` DROP PRIMARY KEY");
    }
    await db.query(
      "ALTER TABLE `Reserves` ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST",
    );
    indexes = await queryInterface.showIndex("Reserves");
  }

  for (const index of indexes) {
    const fields = index.fields.map((field) => field.attribute || field.name);
    if (
      index.unique &&
      !index.primary &&
      fields.includes("user_id") &&
      fields.includes("room_id")
    ) {
      const hasRoomIndex = indexes.some((candidate) => {
        const candidateFields = candidate.fields.map(
          (field) => field.attribute || field.name,
        );
        return !candidate.unique && candidateFields[0] === "room_id";
      });
      const hasUserIndex = indexes.some((candidate) => {
        const candidateFields = candidate.fields.map(
          (field) => field.attribute || field.name,
        );
        return !candidate.unique && candidateFields[0] === "user_id";
      });
      if (!hasRoomIndex) {
        await queryInterface.addIndex("Reserves", ["room_id"], {
          name: "reserves_room_id_idx",
        });
      }
      if (!hasUserIndex) {
        await queryInterface.addIndex("Reserves", ["user_id"], {
          name: "reserves_user_id_idx",
        });
      }
      await queryInterface.removeIndex("Reserves", index.name);
    }
  }
}

async function run() {
  try {
    await db.authenticate();
    console.log("Connected to MySQL successfully.");

    await ensureReservationPrimaryKey();

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
