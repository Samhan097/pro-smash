import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host:process.env.NODEMAILER_SERVER, 
  port:process.env.NODEMAILER_PORT,
  auth:{
    user:process.env.SMTP_USER,
    pass:process.env.SMTP_PASS,
  },
});

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Connection Error: ", error);
  } else {
    console.log("✅ SMTP Server is Ready to Send Emails");
  }
});

export default transporter;

