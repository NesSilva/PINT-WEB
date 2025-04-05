const nodemailer = require("nodemailer");

// Criação do transportador SMTP usando as credenciais do Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',  // Definindo o serviço como Gmail
  auth: {
    user: process.env.EMAIL_USER,  // E-mail do Gmail (e.g., example@gmail.com)
    pass: process.env.EMAIL_PASS,  // Senha de app ou senha da conta (gerada no Google)
  },
});

module.exports = transporter;
