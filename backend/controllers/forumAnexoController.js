// forumAnexoController.js
const ForumTopico = require('../models/ForumTopico');
const ForumAnexo = require('../models/ForumAnexo');
const { bucket } = require('../firebase/firebaseConfig');
const { v4: uuidv4 } = require('uuid');

const adicionarAnexo = async (req, res) => {
    try {
        const { id_topico, isImage } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ 
                success: false, 
                message: "Nenhum arquivo enviado" 
            });
        }

        // Configuração do Firebase Storage
        const blob = bucket.file(`forum/anexos/${uuidv4()}_${file.originalname}`);
        const blobStream = blob.createWriteStream({
            metadata: {
                contentType: file.mimetype,
            },
        });

        const uploadPromise = new Promise((resolve, reject) => {
            blobStream.on('error', (err) => {
                console.error('Erro no upload:', err);
                reject(new Error('Erro ao fazer upload do arquivo'));
            });

            blobStream.on('finish', async () => {
                try {
                    await blob.makePublic();
                    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

                    const anexo = await ForumAnexo.create({
                        id_topico,
                        nome_arquivo: file.originalname,
                        caminho_arquivo: blob.name,
                        url: publicUrl,
                        tipo_arquivo: file.mimetype,
                        tamanho: file.size,
                        is_imagem_principal: isImage === 'true' // Converte string para boolean
                    });

                    // Se for imagem, atualiza a URL no tópico principal
                    if (isImage === 'true') {
                        await ForumTopico.update(
                            { imagem_url: publicUrl },
                            { where: { id_topico } }
                        );
                    }

                    resolve({
                        success: true,
                        message: "Anexo adicionado com sucesso!",
                        anexo,
                        url: publicUrl
                    });
                } catch (error) {
                    reject(error);
                }
            });

            blobStream.end(file.buffer);
        });

        const result = await uploadPromise;
        res.status(201).json(result);

    } catch (error) {
        console.error('Erro ao adicionar anexo:', error);
        res.status(500).json({
            success: false,
            message: error.message || "Erro ao processar anexo",
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
};


// Adicione estas funções se precisar de funcionalidades similares às do conteudoCursoController
const listarAnexosPorTopico = async (req, res) => {
    try {
        const { id_topico } = req.params;
        const anexos = await ForumAnexo.findAll({ 
            where: { id_topico },
            order: [['data_upload', 'DESC']]
        });
        console.log('Anexos encontrados no banco:-----------------', anexos); // <-- LOG 2

        
        res.status(200).json({
            success: true,
            anexos: anexos.map(anexo => ({
                id_anexo: anexo.id_anexo,
                nome_arquivo: anexo.nome_arquivo,
                url: anexo.url,
                tipo_arquivo: anexo.tipo_arquivo,
                tamanho: anexo.tamanho,
                is_imagem_principal: anexo.is_imagem_principal,
                data_upload: anexo.data_upload
            }))
        });
    } catch (error) {
        console.error('Erro ao listar anexos:', error);
        res.status(500).json({
            success: false,
            message: "Erro ao buscar anexos"
        });
    }
};

module.exports = { 
  adicionarAnexo,
  listarAnexosPorTopico
};