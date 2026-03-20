const express = require("express");
const auth = require("../../middlewares/auth");
const { roleGuard } = require("../../middlewares/roleGuard");
const {
  getAll,
  getOne,
  ban,
} = require("../../controllers/v1/users.controller");
const usersRouter = express.Router();

usersRouter.route("/").get(auth, roleGuard("ADMIN"), getAll);
usersRouter.route("/:id").get(auth, roleGuard("ADMIN"), getOne);
usersRouter.route("/:id/ban").post(auth, roleGuard("ADMIN"), ban);

module.exports = usersRouter;
