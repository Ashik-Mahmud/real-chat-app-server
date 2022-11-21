const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const welcomeMessageTemplate = require("../Views/Welcome");
const ResetPasswordEmailTemplate = require("../Views/ResetTemplate");
require("dotenv").config();

const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
  process.env.EMAIL_CLIENT_ID,
  process.env.EMAIL_CLIENT_SECRET,
  process.env.EMAIL_REDIRECT_URI
);
oauth2Client.setCredentials({ refresh_token: process.env.EMAIL_REFRESH_TOKEN });

module.exports.sendMailWithGmail = async (to, name, messageReason) => {
  let html = "";
  let subject = "";
  if (!to) {
    return false;
  }

  if (messageReason === "welcome") {
    subject = "Welcome to Chat App";
    html = `${welcomeMessageTemplate(name)}`;
  } else if (messageReason === "forgotPassword") {
    subject = "Verify to Reset Password";
    html = `${ResetPasswordEmailTemplate(process.env.CLIENT_URL+'/reset-password/'+name)}`;
  }

  try {
    const accessToken = await oauth2Client.getAccessToken();
    const smtpTransport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER,
        clientId: process.env.EMAIL_CLIENT_ID,
        clientSecret: process.env.EMAIL_CLIENT_SECRET,
        refreshToken: process.env.EMAIL_REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      html: html,
    };

    smtpTransport.sendMail(mailOptions, (error, response) => {
      error ? console.log(error) : console.log(response);
      smtpTransport.close();
    });
  } catch (error) {
    console.log(error);
  }
};
