const sgMail = require("@sendgrid/mail");
sendGridAPIKey = process.env.SENDGRID_API_KEY;

sgMail.setApiKey(sendGridAPIKey);

const sendMail = email => {
  sgMail.send({
    to: email,
    from: "abheet25@gmail.com",
    subject: "Sending with Twilio SendGrid is Fun",
    text: "and easy to do anywhere, even with Node.js"
  });
};

module.exports = { sendMail };
