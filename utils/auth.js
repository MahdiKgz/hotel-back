const jwt = require("jsonwebtoken");
const redis = require("../redis");
const bcrypt = require("bcryptjs");

const generateToken = ({ phone }) => {
  const token = jwt.sign({ phone }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
  return token;
};

function getOtpRedisPattern(phone) {
  return `otp:${phone}`;
}

async function getOtpDetails(phone) {
  const otp = await redis.get(getOtpRedisPattern(phone));
  if (!otp) {
    return {
      expired: true,
      remainingTime: 0,
    };
  }

  const remainingTime = await redis.ttl(getOtpRedisPattern(phone)); // Second
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60; // "01:20"
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  return {
    expired: false,
    remainingTime: formattedTime,
  };
}

const generateOtp = async (phone, length = 4, expireTime = 1) => {
  const digist = "0123456789";
  let otp = "";

  for (let i = 0; i < length; i++) {
    otp += digist[Math.random() * digist.length]; // "1" -> "19" -> "192" -> "195"
  }

  //! Temporary
  otp = "1111";

  const hashedOtp = await bcrypt.hash(otp, 12);

  await redis.set(getOtpRedisPattern(phone), hashedOtp, "EX", expireTime * 60);

  return otp;
};

module.exports = {
  generateToken,
  generateOtp,
  getOtpDetails,
  getOtpRedisPattern,
};
