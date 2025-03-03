const Utilizador = require("../models/Utilizador"); // Importar o modelo de Utilizador
const bcrypt = require("bcrypt"); // Para comparar a senha

const login = async (req, res) => {
    try {
        const { Email, Palavra_passe } = req.body;

        if (!Email || !Palavra_passe) {
            return res.status(400).json({ success: false, message: "Email e palavra-passe são obrigatórios." });
        }

        const utilizador = await Utilizador.findOne({ where: { Email } });

        if (!utilizador) {
            return res.status(404).json({ success: false, message: "Utilizador não encontrado." });
        }

        const senhaCorreta = await bcrypt.compare(Palavra_passe, utilizador.Palavra_passe);

        if (!senhaCorreta) {
            return res.status(401).json({ success: false, message: "Palavra-passe incorreta." });
        }

        res.status(200).json({
            success: true,
            message: "Login efetuado com sucesso.",
            utilizador: {
                id: utilizador.ID_utilizador,
                nome: utilizador.Nome,
                email: utilizador.Email,
                idade: utilizador.Idade,
            },
        });
    } catch (error) {
        console.error("Erro no login:", error);
        res.status(500).json({ success: false, message: "Erro no servidor. Tente novamente mais tarde." });
    }
};

module.exports = { login };
