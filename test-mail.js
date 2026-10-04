const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

transporter
  .sendMail({
    from: process.env.MAIL_FROM,
    to: process.env.SMTP_USER,
    subject: "Test from PROJECT-GALA",
    text: "Kung nabasa mo ito, gumagana ang email.",
  })
  .then(() => console.log("SENT"))
  .catch((e) => console.error("FAILED:", e.message));

//   node --env-file=.env test-mail.js
