const { createHmac } = require("node:crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const passwordProof = (user) => createHmac("sha256", process.env.JWT_SECRET)
  .update(JSON.stringify(["session-password", user.id, user.password])).digest("hex");

const generateToken = (user) => {
  const token = jwt.sign({ phone: user.phone, proof: passwordProof(user) }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
  return token;
};

function getOtpRedisPattern(phone) {
  return `otp:${phone}`;
}

async function getOtpDetails(phone) {
  const redis = require("../redis");
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
  const redis = require("../redis");
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
  passwordProof,
  generateOtp,
  getOtpDetails,
  getOtpRedisPattern,
};
