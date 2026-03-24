const express = require("express");
const roomRouter = express.Router();
const { roleGuard } = require("../../middlewares/roleGuard");
const {
  create,
  update,
  getOne,
  remove,
} = require("../../controllers/v1/room.controller");
const auth = require("../../middlewares/auth");

roomRouter.route("/").post(auth, roleGuard("ADMIN,MANAGER"), create);
roomRouter
  .route("/:slug")
  .delete(auth, roleGuard("ADMIN,MANAGER"), remove)
  .put(auth, roleGuard("ADMIN,MANAGER"), update)
  .get(auth, roleGuard("ADMIN,MANAGER"), getOne);

module.exports = roomRouter;
