const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // ex: tonemail@gmail.com
    pass: process.env.EMAIL_PASS, // mot de passe ou app password
  },
});

const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
