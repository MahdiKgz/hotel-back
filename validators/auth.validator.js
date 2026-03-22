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
  email: yup.string().email().nullable(),
  address: yup.string().nullable(),
  avatar: yup.string().nullable(),
  bio: yup.string().nullable(),
});
module.exports = {
  registerValidator,
  updateValidator,
};
