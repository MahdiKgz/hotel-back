const yup = require("yup");

const registerValidator = yup.object().shape({
  fullName: yup.string().max(70).required("fullName is required."),
  phone: yup.string().max(15).required("Phone number is required."),
  email: yup.string().email(),
  password: yup.string().required("Password is required."),
  address: yup.string(),
  avatar: yup.string(),
  bio: yup.string(),
});

const updateValidator = yup.object().shape({
  fullName: yup.string().max(70).required("fullName is required."),
  phone: yup.string().max(15).required("Phone number is required."),
  email: yup.string().email(),
  address: yup.string(),
  avatar: yup.string(),
  bio: yup.string(),
});
module.exports = {
  registerValidator,
  updateValidator,
};
