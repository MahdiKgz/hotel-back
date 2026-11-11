const { randomBytes, createHash } = require("node:crypto");
const bcrypt = require("bcryptjs");
const yup = require("yup");
const db = require("../../configs/db");
const User = require("../../models/v1/User.model");
const Recovery = require("../../models/v1/AccountRecovery.model");
const redis = require("../../redis");
const { getRecoveryMailer } = require("../../services/account-recovery-mail");
const { successResponse, errorResponse } = require("../../utils/responses");

const emailSchema = yup.string().required().email().max(100);
const normalizeEmail = (email) => typeof email === "string" ? email.trim().toLowerCase() : "";
const digest = (value) => createHash("sha256").update(value).digest("hex");
const tokenKey = (kind, token) => `recovery:${kind}:${digest(token)}`;
const invalidLink = (res) => errorResponse(res, 400, "Invalid or expired link");

async function throttle(key, limit, seconds) {
  return Number(await redis.eval(
    "local n = redis.call('INCR', KEYS[1]); if n == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]); end; return n",
    1, `recovery:limit:${key}`, seconds,
  )) <= limit;
}

async function sendLink(mail, kind, user) {
  const token = randomBytes(32).toString("base64url");
  const key = tokenKey(kind, token);
  const email = normalizeEmail(user.email);
  await redis.set(key, JSON.stringify({
    id: user.id, email, passwordDigest: digest(user.password),
  }), "EX", 30 * 60);
  try {
    await mail(kind, email, token);
  } catch (err) {
    await redis.del(key);
    throw err;
  }
}

async function consumeLink(kind, token) {
  if (typeof token !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  const value = await redis.getdel(tokenKey(kind, token));
  return value ? JSON.parse(value) : null;
}

async function withMatchingUser(link, action) {
  if (!link) return false;
  return db.transaction(async (transaction) => {
    const user = await User.findByPk(link.id, { transaction, lock: transaction.LOCK.UPDATE });
    if (!user || normalizeEmail(user.email) !== link.email ||
        digest(user.password) !== link.passwordDigest) return false;
    return action(user, transaction);
  });
}

exports.requestVerification = async (req, res) => {
  if (!await throttle(`verify:${req.user.id}`, 5, 15 * 60)) {
    return errorResponse(res, 429, "Too many requests");
  }
  const password = req.body?.password;
  const user = await User.findByPk(req.user.id);
  if (!user || typeof password !== "string" || !await bcrypt.compare(password, user.password)) {
    return errorResponse(res, 400, "Current password is incorrect");
  }
  if (!emailSchema.isValidSync(normalizeEmail(user.email))) {
    return errorResponse(res, 400, "Save a valid email first");
  }
  const mail = getRecoveryMailer();
  if (!mail) return errorResponse(res, 503, "Email service unavailable");
  try {
    await sendLink(mail, "verify", user);
  } catch {
    return errorResponse(res, 503, "Could not send verification email");
  }
  return successResponse(res, 202, "Verification email sent");
};

exports.verifyEmail = async (req, res) => {
  if (!await throttle(`confirm:${digest(req.ip)}`, 30, 15 * 60)) {
    return errorResponse(res, 429, "Too many requests");
  }
  const link = await consumeLink("verify", req.body?.token);
  try {
    const verified = await withMatchingUser(link, async (user, transaction) => {
      const [state] = await Recovery.findOrCreate({ where: { userId: user.id }, transaction });
      await state.update({ verifiedEmail: link.email }, { transaction });
      return true;
    });
    return verified ? successResponse(res, 200, "Email verified") : invalidLink(res);
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return errorResponse(res, 409, "Email already verified for another account");
    }
    throw error;
  }
};

exports.forgotPassword = async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  if (!emailSchema.isValidSync(email)) return errorResponse(res, 400, "Enter a valid email");
  if (!await throttle(`forgot:${digest(req.ip)}`, 15, 15 * 60)) {
    return errorResponse(res, 429, "Too many requests");
  }
  const mail = getRecoveryMailer();
  if (!mail) return errorResponse(res, 503, "Email service unavailable");

  if (await redis.set(`recovery:cooldown:${digest(email)}`, "1", "EX", 60, "NX")) {
    // Do the lookup and SMTP delivery after responding so timing does not reveal accounts.
    setImmediate(async () => {
      try {
        const state = await Recovery.findOne({ where: { verifiedEmail: email } });
        const user = state && await User.findByPk(state.userId);
        if (user && normalizeEmail(user.email) === email) await sendLink(mail, "reset", user);
      } catch {
        console.error("Account recovery email could not be delivered");
      }
    });
  }
  return successResponse(res, 202, "If the email is verified, a recovery link will be sent");
};

exports.recoverPassword = async (req, res) => {
  if (!await throttle(`reset:${digest(req.ip)}`, 20, 15 * 60)) {
    return errorResponse(res, 429, "Too many requests");
  }
  const { password, confirmPassword } = req.body || {};
  if (typeof password !== "string" || [...password].length < 8 ||
      Buffer.byteLength(password, "utf8") > 72 || password !== confirmPassword) {
    return errorResponse(res, 400, "Passwords must match and have at least 8 characters and at most 72 UTF-8 bytes");
  }
  const link = await consumeLink("reset", req.body.token);
  if (!link) return invalidLink(res);

  const hash = await bcrypt.hash(password, 12);
  const recovered = await withMatchingUser(link, async (user, transaction) => {
    const state = await Recovery.findByPk(user.id, { transaction });
    if (state?.verifiedEmail !== link.email) return false;
    await user.update({ password: hash }, { transaction });
    await state.update({ recoveredAt: new Date() }, { transaction });
    return true;
  });
  return recovered ? successResponse(res, 200, "Password updated") : invalidLink(res);
};
