const AreaFormacao = require('../models/AreaFormacao');
const Categoria = require('../models/Categoria');
const { Op } = require('sequelize');

// Criar nova área de formação (mantido igual)
const criarAreaFormacao = async (req, res) => {
    try {
        const { nome, descricao, id_categoria } = req.body;
        
        if (!nome || !id_categoria) {
            return res.status(400).json({ 
                success: false, 
                message: "Nome e ID da categoria são obrigatórios" 
            });
        }

        const categoria = await Categoria.findByPk(id_categoria);
        if (!categoria) {
            return res.status(404).json({ 
                success: false, 
                message: "Categoria não encontrada" 
            });
        }

        const novaArea = await AreaFormacao.create({
            nome,
            descricao: descricao || null,
            id_categoria
        });

        res.status(201).json({ 
            success: true, 
            message: "Área de formação criada com sucesso",
            area: novaArea
        });
    } catch (error) {
        console.error("Erro ao criar área de formação:", error);
        res.status(500).json({ 
            success: false, 
            message: error.errors?.[0]?.message || "Erro ao criar área de formação" 
        });
    }
};

// Listar todas áreas de formação (modificado)
const listarAreasFormacao = async (req, res) => {
    try {
        // 1. Busca todas as áreas
        const areas = await AreaFormacao.findAll({
            order: [['nome', 'ASC']],
            raw: true // Retorna objetos simples em vez de instâncias do modelo
        });

        // 2. Busca todas as categorias
        const categorias = await Categoria.findAll({
            attributes: ['id_categoria', 'nome'],
            raw: true
        });

        // 3. Cria um mapa de categorias para fácil acesso
        const categoriasMap = {};
        categorias.forEach(cat => {
            categoriasMap[cat.id_categoria] = cat;
        });

        // 4. Combina os dados manualmente
        const areasComCategorias = areas.map(area => ({
            ...area,
            Categoria: categoriasMap[area.id_categoria] || null
        }));

        res.json({ success: true, areas: areasComCategorias });
    } catch (error) {
        console.error("Erro ao listar áreas de formação:", error);
        res.status(500).json({ success: false, message: "Erro ao listar áreas de formação" });
    }
};

// Obter área por ID (modificado)
const obterAreaFormacao = async (req, res) => {
    try {
        const { id } = req.params;
        const area = await AreaFormacao.findByPk(id, { raw: true });
        
        if (!area) {
            return res.status(404).json({ success: false, message: "Área de formação não encontrada" });
        }

        // Busca a categoria separadamente
        const categoria = await Categoria.findByPk(area.id_categoria, {
            attributes: ['id_categoria', 'nome'],
            raw: true
        });

        res.json({ 
            success: true, 
            area: {
                ...area,
                Categoria: categoria || null
            } 
        });
    } catch (error) {
        console.error("Erro ao obter área de formação:", error);
        res.status(500).json({ success: false, message: "Erro ao obter área de formação" });
    }
};

// Atualizar área de formação (mantido igual)
const atualizarAreaFormacao = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, descricao, id_categoria } = req.body;
        
        const area = await AreaFormacao.findByPk(id);
        if (!area) {
            return res.status(404).json({ success: false, message: "Área de formação não encontrada" });
        }
        
        if (id_categoria) {
            const categoria = await Categoria.findByPk(id_categoria);
            if (!categoria) {
                return res.status(404).json({ 
                    success: false, 
                    message: "Categoria não encontrada" 
                });
            }
        }
        
        await area.update({ nome, descricao, id_categoria });
        res.json({ 
            success: true, 
            message: "Área de formação atualizada com sucesso",
            area 
        });
    } catch (error) {
        console.error("Erro ao atualizar área de formação:", error);
        res.status(500).json({ 
            success: false, 
            message: error.errors?.[0]?.message || "Erro ao atualizar área de formação" 
        });
    }
};

const deletarAreaFormacao = async (req, res) => {
    try {
        const { id } = req.params;
        const area = await AreaFormacao.findByPk(id);
        
        if (!area) {
            return res.status(404).json({ success: false, message: "Área de formação não encontrada" });
        }
        
        await area.destroy();
        res.json({ success: true, message: "Área de formação deletada com sucesso" });
    } catch (error) {
        console.error("Erro ao deletar área de formação:", error);
        res.status(500).json({ 
            success: false, 
            message: "Erro ao deletar área de formação. Verifique se não há cursos associados."
        });
    }
};

module.exports = {
    criarAreaFormacao,
    listarAreasFormacao,
    obterAreaFormacao,
    atualizarAreaFormacao,
    deletarAreaFormacao
};