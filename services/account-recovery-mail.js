const nodemailer = require("nodemailer");

function getRecoveryMailer() {
  const { ACCOUNT_EMAIL_SMTP_URL, ACCOUNT_EMAIL_FROM, ACCOUNT_EMAIL_ORIGIN } = process.env;
  if (!ACCOUNT_EMAIL_SMTP_URL || !ACCOUNT_EMAIL_FROM || !ACCOUNT_EMAIL_ORIGIN) return null;

  const smtp = new URL(ACCOUNT_EMAIL_SMTP_URL);
  const origin = new URL(ACCOUNT_EMAIL_ORIGIN);
  if (!["smtp:", "smtps:"].includes(smtp.protocol) ||
      !["http:", "https:"].includes(origin.protocol) ||
      (process.env.NODE_ENV === "production" && origin.protocol !== "https:")) {
    throw new Error("Invalid account email configuration");
  }

  const transport = nodemailer.createTransport({
    url: smtp.href,
    requireTLS: process.env.NODE_ENV === "production" && smtp.protocol === "smtp:",
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 10000,
  });
  return async (kind, to, token) => {
    const verify = kind === "verify";
    const url = new URL(verify ? "/verify-email" : "/reset-password", origin.origin);
    // A fragment keeps the token out of server access logs and referrer headers.
    url.hash = token;
    await transport.sendMail({
      from: ACCOUNT_EMAIL_FROM,
      to,
      subject: verify ? "تأیید ایمیل حساب هُما" : "بازیابی رمز عبور هُما",
      text: [
        verify ? "برای تأیید ایمیل حساب روی لینک زیر بزنید." : "برای انتخاب رمز عبور جدید روی لینک زیر بزنید.",
        url.href,
        "این لینک تا ۳۰ دقیقه معتبر است. اگر این درخواست از طرف شما نبوده، ایمیل را نادیده بگیرید.",
      ].join("\n\n"),
    });
  };
}

module.exports = { getRecoveryMailer };
