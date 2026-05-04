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
  addAmenityToHotel,
  getHotelAmenity,
  deleteOneAmenity,
  createHotelGeometry,
  getHotelGeometry,
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

hotelRouter
  .route("/:hotelId/amenity")
  .post(auth, roleGuard("ADMIN,MANAGER"), addAmenityToHotel)
  .get(auth, roleGuard("ADMIN,MANAGER"), getHotelAmenity);

hotelRouter
  .route("/:hotelId/amenity/:amenityId")
  .delete(auth, roleGuard("ADMIN,MANAGER"), deleteOneAmenity);

hotelRouter
  .route("/:hotelId/rooms")
  .get(auth, roleGuard("ADMIN,MANAGER"), getRooms);

hotelRouter
  .route("/:hotelId/geometry")
  .post(auth, roleGuard("ADMIN,MANAGER"), createHotelGeometry)
  .get(getHotelGeometry);

module.exports = hotelRouter;
