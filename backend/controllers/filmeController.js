var Filme = require('../models/filmes');
var sequelize = require('../models/basededados');


const controllers = {}
sequelize.sync()

controllers.criarFilme = async (req, res) => {
    try {
        const { descricao, titulo, foto } = req.body;
        console.log("Recebido:", descricao, titulo, foto);

        // Buscar o maior id existente
        const maxIdResult = await Filme.max('id');
        const newId = maxIdResult ? maxIdResult + 1 : 1; // Se não houver filmes, começar com 1

        // Criar o novo filme com o id manualmente gerado
        const data = await Filme.create({
            id: newId,
            titulo: titulo,
            foto: foto,
            descricao: descricao,
        });

        res.status(200).json({
            success: true,
            message: "Movie added!",
            data: data
        });
    } catch (error) {
        console.error("Erro ao criar filme:", error);
        res.status(500).json({
            success: false,
            message: "Erro ao adicionar filme. Verifique o console para mais detalhes.",
            error: error.message
        });
    }
};


controllers.listarFilmes = async(req, res) => {
    const data = await Filme.findAll({
    
})
    .then(function(data) {
        return data;
    })
    .catch(error => {
        return error;
    });
    res.json({ success: true, data: data });
}

controllers.atualizarFilme = async(req, res) => {
    const { id } = req.params;
    const { titulo, foto, descricao } = req.body;
    const data = await Filme.update({
            titulo: titulo,
            foto: foto,
            descricao: descricao,
        }, {where:  { id: id}})
    .then(function(data) {
        return data;
    })
    .catch(error => {
        return error;
    });

    res.json({success: true, data: data, message: "Movie successfully updated!"});
}

controllers.deleteFilme = async(req, res) => {
    const { id } = req.params;
    var act = false;
    const data = await Filme.destroy({
        where: {id: id}
    })
    .then(function() {
        act = true;
    })
    .catch(error => {
        return error
    })
    
    res.json({success: act, message: "Movie deleted!"});
}

controllers.getFilme = async(req, res) => {
    const { id } = req.params;
    const data = await Filme.findAll({
        where: {id: id}
    })
    .then(function(data) {
        return data;
    })
    .catch(error => {
        return error;
    });

    res.json({ success: true, data: data });
}

module.exports = controllers;