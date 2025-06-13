const Categoria = require('../models/Categoria');
const { Op } = require('sequelize');

const criarCategoria = async (req, res) => {
    try {
        const { nome, descricao } = req.body;
        
        if (!nome) {
            return res.status(400).json({ success: false, message: "Nome é obrigatório" });
        }

        const novaCategoria = await Categoria.create({
            nome,
            descricao: descricao || null
        });

        res.status(201).json({ 
            success: true, 
            message: "Categoria criada com sucesso",
            categoria: novaCategoria
        });
    } catch (error) {
        console.error("Erro ao criar categoria:", error);
        res.status(500).json({ 
            success: false, 
            message: error.errors?.[0]?.message || "Erro ao criar categoria" 
        });
    }
};

const listarCategorias = async (req, res) => {
    try {
        const categorias = await Categoria.findAll({
            order: [['nome', 'ASC']]
        });
        res.json({ success: true, categorias });
    } catch (error) {
        console.error("Erro ao listar categorias:", error);
        res.status(500).json({ success: false, message: "Erro ao listar categorias" });
    }
};

const obterCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const categoria = await Categoria.findByPk(id);
        
        if (!categoria) {
            return res.status(404).json({ success: false, message: "Categoria não encontrada" });
        }
        
        res.json({ success: true, categoria });
    } catch (error) {
        console.error("Erro ao obter categoria:", error);
        res.status(500).json({ success: false, message: "Erro ao obter categoria" });
    }
};

const atualizarCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, descricao } = req.body;
        
        const categoria = await Categoria.findByPk(id);
        if (!categoria) {
            return res.status(404).json({ success: false, message: "Categoria não encontrada" });
        }
        
        await categoria.update({ nome, descricao });
        res.json({ 
            success: true, 
            message: "Categoria atualizada com sucesso",
            categoria 
        });
    } catch (error) {
        console.error("Erro ao atualizar categoria:", error);
        res.status(500).json({ 
            success: false, 
            message: error.errors?.[0]?.message || "Erro ao atualizar categoria" 
        });
    }
};

const deletarCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const categoria = await Categoria.findByPk(id);
        
        if (!categoria) {
            return res.status(404).json({ success: false, message: "Categoria não encontrada" });
        }
        
        await categoria.destroy();
        res.json({ success: true, message: "Categoria deletada com sucesso" });
    } catch (error) {
        console.error("Erro ao deletar categoria:", error);
        res.status(500).json({ 
            success: false, 
            message: "Erro ao deletar categoria. Verifique se não há cursos associados."
        });
    }
};

module.exports = {
    criarCategoria,
    listarCategorias,
    obterCategoria,
    atualizarCategoria,
    deletarCategoria
};