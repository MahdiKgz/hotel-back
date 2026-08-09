const redis = require("../redis");

const LANDING_CACHE_KEYS = ["landing:overview:v1", "landing:filters:v1"];

function clearLandingCache() {
  if (redis.status !== "ready") return;
  redis.del(...LANDING_CACHE_KEYS).catch(() => {
    // Cache invalidation is best effort and must not affect successful writes.
  });
}

function invalidateLandingCache(req, res, next) {
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    res.on("finish", () => {
      if (res.statusCode >= 200 && res.statusCode < 400) clearLandingCache();
    });
  }
  next();
}

module.exports = invalidateLandingCache;
module.exports.clearLandingCache = clearLandingCache;
