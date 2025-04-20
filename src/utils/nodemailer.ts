// File: src/utils/nodemailer.ts
import nodemailer from 'nodemailer';




// Configura el transporter con tu cuenta de Gmail y contraseña de aplicación
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export default transporter;

