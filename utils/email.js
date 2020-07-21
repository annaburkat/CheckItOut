const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // I. Create transporter
  //MAILTRAP
  const transporter = nodemailer.createTransport({
    // host: process.env.EMAIL_HOST,
    // port: process.env.EMAIL_PORT,
    // auth: {
    //   user: process.env.EMAIL_USERNAME,
    //   pass: process.env.EMAIL_PASSWORD
    // }
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "9adee81949e936",
      pass: "91fb2d7fd376d3"
    }
  });

  // II. Define email options
  const mailOptions = {
    from: "CheckItOut <ankaburkat@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.messageText
  };

  // III. Send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;