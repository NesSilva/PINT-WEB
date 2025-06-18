// models/ForumAvaliacao.js
const { DataTypes } = require("sequelize");
const sequelize = require("./basededados");
const Utilizador = require("./Utilizador");
const ForumPublicacao = require("./forumPublicação");

const ForumAvaliacao = sequelize.define("ForumAvaliacao", {
    id_avaliacao: {
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
    id_utilizador: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Utilizador,
            key: "id_utilizador"
        }
    },
    avaliacao: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    data_avaliacao: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: "forum_avaliacoes",
    timestamps: false
});

module.exports = ForumAvaliacao;