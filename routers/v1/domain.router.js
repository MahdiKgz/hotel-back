const express = require("express");
const auth = require("../../middlewares/auth");
const { roleGuard } = require("../../middlewares/roleGuard");
const {
  create,
  remove,
  update,
  getAll,
  getManagers,
  getCities,
} = require("../../controllers/v1/domain.controller");
const domainRouter = express.Router();

domainRouter
  .route("/amenity")
  .post(auth, roleGuard("ADMIN"), create)
  .get(auth, roleGuard("ADMIN"), getAll);
domainRouter
  .route("/amenity/:amenityId")
  .put(auth, roleGuard("ADMIN"), update)
  .delete(auth, roleGuard("ADMIN"), remove);

domainRouter.route("/managers").get(auth, roleGuard("ADMIN"), getManagers);
domainRouter.route("/cities").get(getCities);

module.exports = domainRouter;
