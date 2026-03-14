const Redis = require("ioredis");

const redis = new Redis(process.env.REDIS_URI || 6379);

redis.on("error", (err) =>
  console.log("Error Occured while connecting to Redis", err),
);

module.exports = redis;
