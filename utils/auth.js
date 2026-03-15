const jwt = require("jsonwebtoken");
const redis = require("../redis");

const generateToken = ({ phone }) => {
  const token = jwt.sign({ phone }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
  return token;
};

const createOtp = async (phone, length = 5, expiresIn = 1) => {
  const digits = "0123456789";
  let otp = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * digits.length);
    otp += digits[randomIndex];
  }

  const otpKey = `otp:${phone}`;
  await redis.set(otpKey, otp, "EX", expiresIn * 60);

  return { success: true, otp };
};

module.exports = {
  generateToken,
  createOtp,
};
