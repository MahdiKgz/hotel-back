const express = require("express");
const roomRouter = express.Router();
const { roleGuard } = require("../../middlewares/roleGuard");
const { create } = require("../../controllers/v1/room.controller");
const auth = require("../../middlewares/auth");

roomRouter.route("/").post(auth, roleGuard("ADMIN,MANAGER"), create);

module.exports = roomRouter;
