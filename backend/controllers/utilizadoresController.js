const Utilizador = require("../models/Utilizador");
const UtilizadorPerfil = require("../models/PerfilUtilizador"); 
const Perfil = require("../models/Perfil"); 
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");



const listarUtilizadores = async (req, res) => {
  try {
    const utilizadores = await Utilizador.findAll({ raw: true });

    const perfisAssociados = await UtilizadorPerfil.findAll({
      attributes: ['id_utilizador', 'id_perfil'],  // Seleciona os ids de utilizador e perfil
      raw: true,
    });

    const utilizadoresComPerfis = await Promise.all(utilizadores.map(async (utilizador) => {
      const perfisIds = perfisAssociados
        .filter(item => item.id_utilizador === utilizador.id_utilizador)
        .map(item => item.id_perfil);

      const perfisNomes = await Promise.all(perfisIds.map(async (id) => {
        const perfil = await Perfil.findOne({ 
          attributes: ['nome'], 
          where: { id_perfil: id }
        });
        return perfil ? perfil.nome : null;
      }));

      return {
        ...utilizador,
        perfis: perfisNomes.filter(nome => nome !== null).join(', ') || 'Sem perfil', // Junta os nomes ou retorna 'Sem perfil'
      };
    }));

    // Retorna os utilizadores com os nomes dos perfis associados
    res.json(utilizadoresComPerfis);
  } catch (error) {
    console.error("Erro ao listar utilizadores:", error);
    res.status(500).json({ erro: "Erro ao buscar utilizadores." });
  }
};

// Função para eliminar um utilizador
const eliminarUtilizador = async (req, res) => {
  const { id_utilizador } = req.params; // O id do utilizador a ser eliminado

  try {
    // Remover as associações de perfil do utilizador
    await UtilizadorPerfil.destroy({
      where: { id_utilizador }
    });

    // Remover o utilizador
    await Utilizador.destroy({
      where: { id_utilizador }
    });

    res.status(200).json({ message: "Utilizador e perfis associados removidos com sucesso." });
  } catch (error) {
    console.error("Erro ao eliminar utilizador:", error);
    res.status(500).json({ erro: "Erro ao eliminar utilizador." });
  }
};

const editarUtilizador = async (req, res) => {
  const { id_utilizador } = req.params;
  const { nome, email, morada, perfis, senha } = req.body;

  try {
    const dadosParaAtualizar = { nome, email, morada };

    if (senha && senha.trim() !== "") {
      const saltRounds = 10;
      const senhaEncriptada = await bcrypt.hash(senha, saltRounds);
      dadosParaAtualizar.senha = senhaEncriptada;
    }

    const utilizadorAtualizado = await Utilizador.update(
      dadosParaAtualizar,
      { where: { id_utilizador } }
    );

    if (utilizadorAtualizado[0] === 0) {
      return res.status(404).json({ message: "Utilizador não encontrado." });
    }

    await UtilizadorPerfil.destroy({ where: { id_utilizador } });

    for (const nomePerfil of perfis) {
      const perfil = await Perfil.findOne({ where: { nome: nomePerfil } });
      if (perfil) {
        await UtilizadorPerfil.create({
          id_utilizador,
          id_perfil: perfil.id_perfil
        });
      }
    }

    res.status(200).json({ message: "Utilizador e perfis atualizados com sucesso." });
  } catch (error) {
    console.error("Erro ao atualizar utilizador:", error);
    res.status(500).json({ erro: "Erro ao atualizar utilizador." });
  }
};

const criarUtilizador = async (req, res) => {
    try {
      const { nome, email, morada, senha, perfis } = req.body;
  
      if (!nome || !email || !morada || !senha) {
        return res.status(400).json({ message: "Todos os campos são obrigatórios, incluindo a senha." });
      }
  
      const bcrypt = require("bcrypt");
      const saltRounds = 10;
      const senhaEncriptada = await bcrypt.hash(senha, saltRounds);
  
      const novoUtilizador = await Utilizador.create({
        nome,
        email,
        morada,
        senha: senhaEncriptada
      });
  
      if (Array.isArray(perfis)) {
        for (const nomePerfil of perfis) {
          const perfil = await Perfil.findOne({ where: { nome: nomePerfil } });
          if (perfil) {
            await UtilizadorPerfil.create({
              id_utilizador: novoUtilizador.id_utilizador,
              id_perfil: perfil.id_perfil
            });
          }
        }
      }
  
      return res.status(200).json({ message: "Utilizador criado com sucesso!" });
    } catch (error) {
      console.error("Erro ao criar utilizador:", error);
      return res.status(500).json({ message: "Erro ao criar utilizador." });
    }
  };

const solicitarConta = async (req, res) => {
    try {
        const { email, numeroColaborador } = req.body;

        const pedidoExistente = await Utilizador.findOne({ where: { email } });

        if (pedidoExistente) {
            return res.status(400).json({ 
                success: false,
                message: pedidoExistente.pedidoAceitoSN === null ? 
                    "Já existe um pedido pendente para este email" :
                    "Este email já possui uma conta ativa"
            });
        }

        await Utilizador.create({
            email,
            numeroColaborador,
            pedidoAceitoSN: null,
            primeiroLogin: 0  
            
        });

        return res.status(200).json({ 
            success: true,
            message: "Pedido de conta registrado com sucesso"
        });

    } catch (error) {
        console.error("Erro ao processar pedido de conta:", error);
        return res.status(500).json({ 
            success: false,
            message: "Erro ao processar pedido"
        });
    }
};

const atualizarPedidoAceite = async (req, res) => {
  const { id_utilizador } = req.params;
  const { pedidoAceitoSN } = req.body;

  try {
    const [linhasAfetadas] = await Utilizador.update(
      { pedidoAceitoSN },
      { where: { id_utilizador } }
    );

    if (linhasAfetadas === 0) {
      return res.status(404).json({ message: "Utilizador não encontrado." });
    }

    return res.status(200).json({ message: "Estado do pedido atualizado com sucesso." });
  } catch (error) {
    console.error("Erro ao atualizar pedidoAceitoSN:", error);
    return res.status(500).json({ message: "Erro interno ao atualizar pedido." });
  }
};

const sendAccountAcceptedEmail = async (email, password) => {
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
        subject: "Conta aprovada - Acesso à plataforma",
        text: `A sua conta foi aprovada com sucesso!

Credenciais de acesso:
Email: ${email}
Senha temporária: ${password}

Ao entrar pela primeira vez, será solicitado que altere sua senha.

Acesse: https://seu-sistema.com/login
        
Obrigado,
Equipe de suporte`
    };

    return transporter.sendMail(mailOptions);
};

const aceitarPedidoConta = async (req, res) => {
    console.log("entreiiiiiiiiiiiiiiiii-----------------------------------------");
    const { id_utilizador } = req.body;
    console.log("Chamada para aceitarPedidoConta com ID:", id_utilizador);

    try {
        const utilizador = await Utilizador.findOne({ where: { id_utilizador } });


        if (!utilizador || utilizador.pedidoAceitoSN === true) {
            return res.status(404).json({ success: false, message: "Pedido não encontrado ou já processado." });
        }

        const tempPassword = crypto.randomBytes(4).toString("hex");
        console.log("Senha temporária gerada:", tempPassword);

        const hashedPassword = await bcrypt.hash(tempPassword, 12);
        utilizador.senha = hashedPassword;
        utilizador.pedidoAceitoSN = 1;
        utilizador.primeiroLogin = 0;

       await utilizador.save();
      console.log("Utilizador salvo com sucesso:", utilizador.id_utilizador);

      await sendAccountAcceptedEmail(utilizador.email, tempPassword).catch(err => {
          console.error("Erro ao enviar email:", err);
      });

      return res.status(200).json({ success: true, message: "Conta aprovada e e-mail enviado com sucesso." });
    } catch (error) {
        console.error("Erro ao aprovar pedido:", error);
        return res.status(500).json({ success: false, message: "Erro ao aprovar conta." });
    }
};


  
module.exports = { listarUtilizadores, eliminarUtilizador, editarUtilizador , criarUtilizador , solicitarConta , atualizarPedidoAceite , sendAccountAcceptedEmail , aceitarPedidoConta};
