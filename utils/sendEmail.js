const nodemailer = require("nodemailer");
const ApiError = require("./ApiError"); // Import ApiError to throw a custom error

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: options.email,
      subject: options.subject,
      html: options.message,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
    // Throw a custom ApiError to be caught by asyncHandler and handled by errorMiddleware
    throw new ApiError(
      500,
      "Failed to send email. Please check your email configuration."
    );
  }
};

module.exports = sendEmail;
