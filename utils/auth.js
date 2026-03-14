const jwt = require("jsonwebtoken");

const generateToken = ({ phone }) => {
  const token = jwt.sign({ phone }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
  return token;
};

module.exports = {
  generateToken,
};
