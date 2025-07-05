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
    const existente = await Certificado.findOne({ where: { id_utilizador, id_curso } });
    
    if (existente) {
      return res.json({ 
        success: true, 
        certificado: existente,
        message: "Certificado já existe e pode ser baixado novamente."
      });
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

  // Criar novo documento PDF
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 50, right: 50 }
  });

  // Configurar headers da resposta
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition", 
    `attachment; filename=certificado_${curso.replace(/\s+/g, '_')}.pdf`
  );

  // Conteúdo do certificado
  doc.fontSize(25)
     .font('Helvetica-Bold')
     .text("Certificado de Conclusão", { align: "center" });
  
  doc.moveDown(1.5);
  
  doc.fontSize(16)
     .font('Helvetica')
     .text(`Certificamos que ${user} concluiu com sucesso o curso "${curso}".`, { 
       align: "center",
       lineGap: 5
     });
  
  doc.moveDown(2);
  
  doc.fontSize(12)
     .text(`Data de emissão: ${new Date().toLocaleDateString('pt-PT')}`, { 
       align: "center"
     });

  // Finalizar e enviar o PDF
  doc.end();
  doc.pipe(res);
});

module.exports = router;
