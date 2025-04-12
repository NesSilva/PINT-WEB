const bcrypt = require("bcrypt");
const Utilizador = require("../models/Utilizador");
const nodemailer = require("nodemailer");
const crypto = require("crypto"); 

const generateResetCode = () => {
    return crypto.randomBytes(3).toString("hex");  
};

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

const requestPasswordReset = async (req, res) => {
    const { email } = req.body;

    console.log("Requisição recebida para reset de senha para o e-mail:", email); 

    try {
        const utilizador = await Utilizador.findOne({ where: { email } });

        if (!utilizador) {
            return res.status(404).json({ success: false, message: "E-mail não encontrado." });
        }

        const resetCode = generateResetCode();
        utilizador.resetCode = resetCode;
        utilizador.resetCodeExpiry = Date.now() + 3600000; 
        await utilizador.save();

        await sendResetEmail(email, resetCode);
        return res.status(200).json({ success: true, message: "Código de recuperação enviado." });
    } catch (error) {
        console.error("Erro no backend:", error); 
        res.status(500).json({ success: false, message: "Erro no servidor. Tente novamente mais tarde." });
    }
};


const resetPassword = async (req, res) => {
    const { email, resetCode, newPassword } = req.body;

    try {
        const utilizador = await Utilizador.findOne({ where: { email } });

        if (!utilizador) {
            return res.status(404).json({ success: false, message: "E-mail não encontrado." });
        }

        if (utilizador.resetCode !== resetCode || utilizador.resetCodeExpiry < Date.now()) {
            return res.status(400).json({ success: false, message: "Código inválido ou expirado." });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        utilizador.senha = hashedPassword;
        utilizador.resetCode = null; 
        utilizador.resetCodeExpiry = null;  
        await utilizador.save();

        return res.status(200).json({ success: true, message: "Senha alterada com sucesso." });
    } catch (error) {
        console.error("Erro ao resetar senha:", error);
        res.status(500).json({ success: false, message: "Erro no servidor. Tente novamente mais tarde." });
    }
};

const updateFirstLoginPassword = async (req, res) => {
    const { email, newPassword } = req.body;

    try {
        const utilizador = await Utilizador.findOne({ where: { email } });

        if (!utilizador) {
            return res.status(404).json({ success: false, message: "Utilizador não encontrado." });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);
        utilizador.senha = hashedPassword;
        utilizador.primeiroLogin = 1;

        await utilizador.save();

        return res.status(200).json({ success: true, message: "Senha atualizada com sucesso." });
    } catch (err) {
        console.error("Erro ao atualizar senha:", err);
        res.status(500).json({ success: false, message: "Erro no servidor." });
    }
};

module.exports = { requestPasswordReset, resetPassword, updateFirstLoginPassword };
