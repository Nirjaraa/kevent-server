import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const user = process.env.EMAIL;
const pass = process.env.EMAIL_APP_PW;

const sendEmail = async (recipient: string, subject: string, text: string) => {
  // Create a transporter for sending email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });

  const mailOptions = {
    from: user,
    to: recipient,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error occurred while sending email:", error);
  }
};

const sendOtp = (firstName: string, otp: string) => {
  return `Dear ${firstName},
    Your OTP code is ${otp}`;
};

const verifyEmails = (firstName: String, verificationCode: string) => {
  const text = `Dear ${firstName},
  Your verification code is: ${verificationCode}
  The Kevent Team
  [Do Not Reply]`;
  return text;
};
export { sendEmail, sendOtp, verifyEmails };
