const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: 'gmail',  // Serviçõ de email escolhido , neste caso foi o
  auth: {
    user: process.env.EMAIL_USER,  // E-mail do Gmail (e.g., example@gmail.com)
    pass: process.env.EMAIL_PASS,  // Senha de app ou senha da conta (gerada no Google)
  },
});

module.exports = transporter;
