// models/ForumDenuncia.js
const { DataTypes } = require("sequelize");
const sequelize = require("./basededados");
const Utilizador = require("./Utilizador");
const ForumPublicacao = require("./forumPublicação");

const ForumDenuncia = sequelize.define("ForumDenuncia", {
    id_denuncia: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_publicacao: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: ForumPublicacao,
            key: "id_publicacao"
        }
    },
    id_comentario: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "forum_comentarios",
            key: "id_comentario"
        }
    },
    id_denunciante: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Utilizador,
            key: "id_utilizador"
        }
    },
    motivo: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    data_denuncia: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    status: {
        type: DataTypes.STRING(20),
        defaultValue: "pendente",
        validate: {
            isIn: [["pendente", "analisado", "rejeitado"]]
        }
    }
}, {
    tableName: "forum_denuncias",
    timestamps: false
});

module.exports = ForumDenuncia;