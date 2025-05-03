const ConteudoCurso = require("../models/ConteudoCurso");
const { bucket } = require("../firebase/firebaseConfig");
const { v4: uuidv4 } = require("uuid");

const adicionarConteudo = async (req, res) => {
  console.log('Arquivo recebido:', req.file);

  try {
    const { id_curso, descricao } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: "Nenhum ficheiro enviado." });
    }

    const blob = bucket.file(`conteudos/${uuidv4()}_${file.originalname}`);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    blobStream.on("error", (err) => {
      console.error("Erro no upload:", err);
      res.status(500).json({ success: false, message: "Erro ao fazer upload." });
    });

    blobStream.on("finish", async () => {
      // Torna o ficheiro público
      await blob.makePublic();
      
      // Gera a URL pública
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
    
      const conteudo = await ConteudoCurso.create({
        id_curso,
        tipo_conteudo: "ficheiro",
        url: publicUrl,
        caminho_arquivo: blob.name,
        descricao: descricao || "Material do curso",
      });
    
      res.status(201).json({ 
        success: true, 
        message: "Conteúdo adicionado!", 
        conteudo 
      });
    });
    

    blobStream.end(file.buffer);
  } catch (error) {
    console.error("Erro ao adicionar conteúdo:", error);
    res.status(500).json({ 
      success: false, 
      message: "Erro no servidor.",
      error: error.message 
    });
  }
};

const adicionarConteudosMultiplos = async (req, res) => {
  try {
    const { id_curso, descricao } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: "Nenhum ficheiro enviado." });
    }

    const resultados = [];

    for (const file of files) {
      const blob = bucket.file(`conteudos/${uuidv4()}_${file.originalname}`);
      const blobStream = blob.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });

      await new Promise((resolve, reject) => {
        blobStream.on("error", reject);
        blobStream.on("finish", async () => {
          await blob.makePublic();
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

          const conteudo = await ConteudoCurso.create({
            id_curso,
            tipo_conteudo: "ficheiro",
            url: publicUrl,
            caminho_arquivo: blob.name,
            descricao: descricao || "Material do curso",
          });

          resultados.push(conteudo);
          resolve();
        });

        blobStream.end(file.buffer);
      });
    }

    res.status(201).json({
      success: true,
      message: "Conteúdos adicionados!",
      conteudos: resultados
    });

  } catch (error) {
    console.error("Erro ao adicionar múltiplos conteúdos:", error);
    res.status(500).json({ success: false, message: "Erro no servidor." });
  }
};

module.exports = { adicionarConteudo , adicionarConteudosMultiplos};
