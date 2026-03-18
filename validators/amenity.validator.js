const yup = require("yup");

const createAmenityValidator = yup.object().shape({
  title: yup.string().required("Title is required"),
  description: yup.string(),
  isActive: yup.boolean().required("activation status is required."),
});

module.exports = {
  createAmenityValidator,
};
