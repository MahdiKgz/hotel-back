const { Redis } = require("ioredis");

const redis = new Redis(
  process.env.REDIS_URI || "redis://127.0.0.1:6379",
  {
    maxRetriesPerRequest: 2,
    enableReadyCheck: true,
    retryStrategy(times) {
      return Math.min(times * 250, 3000);
    },
  },
);

redis.on("error", (err) =>
  console.log("Redis connection error:", err.message),
);

redis.on("ready", () => console.log("Connected to Redis successfully."));

module.exports = redis;
