const express = require("express");
const hotelRouter = express.Router();

const {
  create,
  getOneHotel,
  update,
  remove,
  setCover,
  setImages,
  getAll,
  getRooms,
} = require("../../controllers/v1/hotel.controller");

const auth = require("../../middlewares/auth");
const { roleGuard } = require("../../middlewares/roleGuard");
const { multerStorage } = require("../../utils/multer-uploader");

const upload = multerStorage("uploads/covers/");

hotelRouter
  .route("/")
  .post(auth, roleGuard("ADMIN,MANAGER"), create)
  .get(auth, roleGuard("ADMIN"), getAll);
hotelRouter
  .route("/:slug")
  .get(getOneHotel)
  .put(auth, roleGuard("ADMIN,MANAGER"), update)
  .delete(auth, roleGuard("ADMIN,MANAGER"), remove);

hotelRouter
  .route("/:slug/cover")
  .post(auth, roleGuard("ADMIN,MANAGER"), upload.single("cover"), setCover);

hotelRouter
  .route("/:slug/images")
  .post(
    auth,
    roleGuard("ADMIN<MANAGER"),
    upload.array("images", 10),
    setImages,
  );

hotelRouter.route("/:hotelId/rooms").get(getRooms);

module.exports = hotelRouter;
