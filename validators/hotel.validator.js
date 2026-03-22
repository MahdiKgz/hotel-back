const yup = require("yup");

const createHotelValidator = yup.object().shape({
  name: yup.string().max(40).required("name is required"),
  slug: yup.string().max(30).required("slug is required"),
  country: yup
    .number()
    .integer()
    .positive()
    .required("country id is required."),
  city: yup.number().integer().positive().required("city id is required."),
  address: yup.string().required("address is required."),
  postalCode: yup.string().required("postal code is required."),
  stars: yup.string().required("stars count is required."),
  metroAccess: yup.string(),
  description: yup.string(),
  manager_id: yup.number().integer().positive().nullable(),
});

const updateHotelValidator = yup.object().shape({
  name: yup.string().max(40),
  slug: yup.string().max(30),
  country: yup.number().integer().positive(),
  city: yup.number().integer().positive(),
  address: yup.string(),
  postalCode: yup.string(),
  stars: yup.string(),
  metroAccess: yup.string(),
  description: yup.string(),
  manager_id: yup.number().integer().positive(),
});

module.exports = {
  createHotelValidator,
  updateHotelValidator,
};
