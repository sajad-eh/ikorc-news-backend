import nodemailer from "nodemailer";

export const sendEmail = async (option) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Define email options
  const emailOptions = {
    from: option.from,
    to: option.to,
    subject: option.subject,
    text: option.message,
  };

  await transporter.sendMail(emailOptions);
};
