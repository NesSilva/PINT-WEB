const Utilizador = require("../models/Utilizador");
const bcrypt = require("bcrypt"); 

const login = async (req, res) => {
    try {
        const { email, senha } = req.body;
        console.log("Dados recebidos:", { email, senha });

        if (!email || !senha) {
            console.log("Email ou senha em falta.");
            return res.status(400).json({ success: false, message: "Email e palavra-passe são obrigatórios." });
        }

        // Buscar todos os dados (incluindo senha) primeiro
        const utilizador = await Utilizador.findOne({
            where: { email }
        });

        console.log("Resultado da query:", utilizador);

        if (!utilizador) {
            console.log("Utilizador não encontrado no sistema.");
            return res.status(404).json({ success: false, message: "Utilizador não encontrado." });
        }

        console.log("Senha inserida:", senha);
        console.log("Hash na BD:", utilizador.senha);

        const hashNaBD = utilizador.senha.replace("$2y$", "$2b$"); // compatibilidade
        const senhaCorreta = await bcrypt.compare(senha, hashNaBD);

        console.log("Resultado da comparação da senha:", senhaCorreta);

        if (!senhaCorreta) {
            console.log("Palavra-passe incorreta.");
            return res.status(401).json({ success: false, message: "Palavra-passe incorreta." });
        }

        console.log("Login efetuado com sucesso para:", utilizador.email);

        res.status(200).json({
            success: true,
            message: "Login efetuado com sucesso.",
            user: {
                id: utilizador.id_utilizador,
                nome: utilizador.nome,
                email: utilizador.email,
                primeiroLogin: utilizador.primeiroLogin // <- agora o frontend recebe isto!
            },
        });
    } catch (error) {
        console.error("Erro no login:", error);
        res.status(500).json({ success: false, message: "Erro no servidor. Tente novamente mais tarde." });
    }
};

module.exports = { login };
