// models/ForumComentario.js
const { DataTypes } = require("sequelize");
const sequelize = require("./basededados");
const Utilizador = require("./Utilizador");
const ForumPublicacao = require("./forumPublicação");

const ForumComentario = sequelize.define("ForumComentario", {
    id_comentario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_publicacao: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: ForumPublicacao,
            key: "id_publicacao"
        }
    },
    id_autor: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Utilizador,
            key: "id_utilizador"
        }
    },
    conteudo: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    data_comentario: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: "forum_comentarios",
    timestamps: false
});

module.exports = ForumComentario;