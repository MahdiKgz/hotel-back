const yup = require("yup");

const registerValidator = yup.object().shape({
  fullName: yup.string().max(70).required("fullName is required."),
  phone: yup.string().max(15).required("Phone number is required."),
  email: yup.string().email(),
  address: yup.string(),
  avatar: yup.string(),
  bio: yup.string(),
  role: yup.string().required("Role is required"),
});

module.exports = {
  registerValidator,
};
