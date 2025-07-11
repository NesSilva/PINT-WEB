const Inscricao = require("../models/Inscricoes");
const Utilizador = require("../models/Utilizador");
const Curso = require("../models/Curso");
const nodemailer = require("nodemailer");

const enviarEmailConfirmacaoInscricao = async (email, nomeCurso, dataInicio) => {
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
    subject: `Confirmação de inscrição no curso: ${nomeCurso}`,
    text: `Olá,

Sua inscrição no curso "${nomeCurso}" foi realizada com sucesso!

O curso inicia em: ${new Date(dataInicio).toLocaleDateString('pt-PT')}

Obrigado por se inscrever!

Atenciosamente,
Equipe do curso`
  };

  return transporter.sendMail(mailOptions);
};

const criarInscricao = async (req, res) => {
  try {
    const { id_utilizador, id_curso } = req.body;

    if (!id_utilizador || !id_curso) {
      return res.status(400).json({ mensagem: "Dados incompletos." });
    }

    // Verifica se o curso existe
    const curso = await Curso.findOne({ where: { id_curso } });
    if (!curso) {
      return res.status(404).json({ mensagem: "Curso não encontrado." });
    }

    // Verifica se o curso está ativo e não terminou
    if (!curso.ativo || curso.estado === 'terminado') {
      return res.status(400).json({ mensagem: "Este curso não está disponível para inscrição." });
    }

    // Verifica se já existe inscrição para o usuário e curso
    const inscricaoExistente = await Inscricao.findOne({
      where: { id_utilizador, id_curso }
    });

    if (inscricaoExistente) {
      return res.status(409).json({ mensagem: "Usuário já está inscrito neste curso." });
    }

    // Verifica vagas disponíveis para cursos síncronos
    if (curso.tipo === 'sincrono') {
      const totalInscritos = await Inscricao.count({
        where: { id_curso, status: ['pendente', 'confirmada'] }
      });

      if (totalInscritos >= curso.vagas) {
        return res.status(400).json({ mensagem: "Não há vagas disponíveis para este curso." });
      }
    }

    // Cria nova inscrição
    const novaInscricao = await Inscricao.create({
      id_utilizador,
      id_curso,
      data_inscricao: new Date(),
      status: "pendente"
    });

    // Buscar utilizador para enviar email
    const utilizador = await Utilizador.findOne({ where: { id_utilizador } });

    if (utilizador && curso) {
      try {
        await enviarEmailConfirmacaoInscricao(utilizador.email, curso.titulo, curso.data_inicio);
      } catch (err) {
        console.error("Erro ao enviar email de confirmação de inscrição:", err);
        // Não interrompe o processo, só loga o erro
      }
    }

    return res.status(201).json({
      success: true,
      message: "Inscrição realizada com sucesso!",
      inscricao: novaInscricao
    });
  } catch (error) {
    console.error("Erro ao criar inscrição:", error);
    return res.status(500).json({ 
      success: false,
      message: "Erro interno ao processar inscrição.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const listarInscricoes = async (req, res) => {
  try {
    const inscricoes = await Inscricao.findAll();

    return res.status(200).json(inscricoes);
  } catch (error) {
    console.error("Erro ao listar inscrições:", error);
    return res.status(500).json({ mensagem: "Erro ao listar inscrições." });
  }
};

module.exports = { criarInscricao, listarInscricoes };