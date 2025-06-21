const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");

const Certificado = require("../models/Certificado");

// Rota para criar o certificado na base de dados
router.post("/", async (req, res) => {
  const { id_utilizador, id_curso } = req.body;

  if (!id_utilizador || !id_curso) {
    return res.status(400).json({ error: "Parâmetros faltando." });
  }

  try {
    // Verifica se já existe certificado para evitar duplicação
    const existente = await Certificado.findOne({ where: { id_utilizador, id_curso } });
    if (existente) {
      return res.status(409).json({ error: "Certificado já existe." });
    }

    const certificado = await Certificado.create({
      id_utilizador,
      id_curso,
      data_emissao: new Date()
    });

    res.json({ success: true, certificado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao gerar certificado." });
  }
});

// Rota para gerar e enviar o PDF do certificado
router.get("/pdf", async (req, res) => {
  const { user, curso } = req.query;

  // Aqui podes buscar os dados reais do utilizador e do curso para personalizar o PDF, exemplo:
  // const utilizador = await Utilizador.findByPk(user);
  // const cursoDados = await Curso.findByPk(curso);

  const doc = new PDFDocument();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=certificado_${curso}.pdf`);

  doc.fontSize(25).text("Certificado de Conclusão", { align: "center" });
  doc.moveDown();
  doc.fontSize(16).text(`Certificamos que o utilizador ${user} concluiu o curso ${curso}.`, { align: "center" });
  doc.moveDown();
  doc.text(`Data: ${new Date().toLocaleDateString()}`, { align: "center" });

  doc.end();
  doc.pipe(res);
});

module.exports = router;
