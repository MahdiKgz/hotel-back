const Amenity = require("../../models/v1/Amenity.model");
const User = require("../../models/v1/User.model");
const { errorResponse, successResponse } = require("../../utils/responses");
const {
  createAmenityValidator,
} = require("../../validators/amenity.validator");

exports.create = async (req, res, next) => {
  try {
    const { title } = req.body;
    await createAmenityValidator.validate(req.body, { abortEarly: false });
    const amenity = await Amenity.findOne({
      where: {
        title,
      },
      raw: true,
    });

    if (amenity !== null) {
      return errorResponse(res, 400, "Amenity already exists");
    }

    await Amenity.create(req.body);
    return successResponse(res, 201, "Amenity created successfully !!");
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { amenityId } = req.params;
    const amenity = await Amenity.findOne({
      where: {
        id: amenityId,
      },
    });

    if (amenity === null) {
      return errorResponse(res, 404, "Amenity NOT found !!");
    }

    await Amenity.update({ ...req.body }, { where: { id: amenityId } });

    return successResponse(res, 200, "Amenity updated successfully !!");
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { amenityId } = req.params;
    const amenity = await Amenity.findOne({
      where: {
        id: amenityId,
      },
    });

    if (amenity === null) {
      return errorResponse(res, 404, "Amenity NOT found !!");
    }

    await Amenity.destroy({ where: { id: amenityId } });

    return successResponse(res, 200, "Amenity removed successfully !!");
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const amenities = await Amenity.findAll({
      attributes: ["id", "title", "description", "isActive"],
    });
    if (amenities === null) {
      return errorResponse(res, 404, "Could not find any Amenities.");
    }

    return successResponse(res, 200, "", { amenities });
  } catch (err) {
    next(err);
  }
};

exports.getManagers = async (req, res, next) => {
  try {
    const managers = await User.findAll({
      where: {
        role: "MANAGER",
      },
      raw: true,
    });

    if (managers === null) {
      return errorResponse(res, 404, "No Managers found !!");
    }

    const managersOptions = managers.map((manager) => ({
      value: manager.id,
      label: manager.fullName,
    }));

    console.log("managersOptions", managersOptions);

    return successResponse(res, 200, "", { managersOptions });
  } catch (err) {
    next(err);
  }
};
