const bcrypt = require("bcrypt");
const Utilizador = require("../models/Utilizador");
const nodemailer = require("nodemailer");
const crypto = require("crypto");  // Para gerar um código aleatório

// Função para gerar um código de recuperação
const generateResetCode = () => {
    return crypto.randomBytes(3).toString("hex");  // Gerando código de 6 caracteres
};

// Função para enviar o e-mail com o código
const sendResetEmail = async (email, resetCode) => {
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Código de Recuperação de Senha",
        text: `Seu código de recuperação é: ${resetCode}`,
    };

    return transporter.sendMail(mailOptions);

};

// Controller para solicitar o reset da senha
const requestPasswordReset = async (req, res) => {
    const { email } = req.body;

    console.log("Requisição recebida para reset de senha para o e-mail:", email); // Adicione o log aqui

    try {
        const utilizador = await Utilizador.findOne({ where: { email } });

        if (!utilizador) {
            return res.status(404).json({ success: false, message: "E-mail não encontrado." });
        }

        const resetCode = generateResetCode();
        utilizador.resetCode = resetCode;
        utilizador.resetCodeExpiry = Date.now() + 3600000; // Expira em 1 hora
        await utilizador.save();

        await sendResetEmail(email, resetCode);
        return res.status(200).json({ success: true, message: "Código de recuperação enviado." });
    } catch (error) {
        console.error("Erro no backend:", error); // Log de erro
        res.status(500).json({ success: false, message: "Erro no servidor. Tente novamente mais tarde." });
    }
};


// Controller para verificar o código e permitir a alteração da senha
const resetPassword = async (req, res) => {
    const { email, resetCode, newPassword } = req.body;

    try {
        const utilizador = await Utilizador.findOne({ where: { email } });

        if (!utilizador) {
            return res.status(404).json({ success: false, message: "E-mail não encontrado." });
        }

        // Verificar se o código é válido e se não expirou
        if (utilizador.resetCode !== resetCode || utilizador.resetCodeExpiry < Date.now()) {
            return res.status(400).json({ success: false, message: "Código inválido ou expirado." });
        }

        // Criptografar a nova senha
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // Atualizar a senha na base de dados
        utilizador.senha = hashedPassword;
        utilizador.resetCode = null;  // Limpar o código de reset
        utilizador.resetCodeExpiry = null;  // Limpar a expiração do código
        await utilizador.save();

        return res.status(200).json({ success: true, message: "Senha alterada com sucesso." });
    } catch (error) {
        console.error("Erro ao resetar senha:", error);
        res.status(500).json({ success: false, message: "Erro no servidor. Tente novamente mais tarde." });
    }
};

module.exports = { requestPasswordReset, resetPassword };
