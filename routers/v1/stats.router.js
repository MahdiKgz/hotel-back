const express = require("express");
const auth = require("../../middlewares/auth");
const { roleGuard } = require("../../middlewares/roleGuard");
const { getStats } = require("../../controllers/v1/stats.controller");

const statsRouter = express.Router();

statsRouter.route("/").get(auth, roleGuard("ADMIN"), getStats);

module.exports = statsRouter;
