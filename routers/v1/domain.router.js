const express = require("express");
const auth = require("../../middlewares/auth");
const { roleGuard } = require("../../middlewares/roleGuard");
const {
  create,
  remove,
  update,
} = require("../../controllers/v1/domain.controller");
const domainRouter = express.Router();

domainRouter.route("/amenity").post(auth, roleGuard("ADMIN"), create);
domainRouter
  .route("/amenity/:amenityId")
  .put(auth, roleGuard("ADMIN"), update)
  .delete(auth, roleGuard("ADMIN"), remove);

module.exports = domainRouter;
