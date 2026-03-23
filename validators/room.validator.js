const yup = require("yup");

const createRoomValidator = yup.object().shape({
  name: yup.string().required("name is required."),
  slug: yup.string().required("slug is required."),
  capacity: yup
    .number()
    .integer()
    .positive("capacity can not be minus.")
    .required("capacity is required"),
  status: yup.string().required("status can not be null."),
  price: yup.number().positive().required("price is required."),
  bookType: yup.string().required("book type should be filled."),
  bathService: yup.string().required("bath service should be filled."),
  balcony: yup.number().required("balcony is required."),
  geoDirection: yup.string().required("geo direction is required."),
  kitchen: yup.string().required("kitchen status is required."),
  description: yup.string().nullable(),
});

module.exports = {
  createRoomValidator,
};
