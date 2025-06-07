const { DataTypes } = require("sequelize");
const sequelize = require("./basededados");
const forum_publicacoes = require("./forumPublicação")
const Utilizador = require("./Utilizador")

const Comentario = sequelize.define("Comentario", {
    id_comentario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_publicacao: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: forum_publicacoes,
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
    tableName: "comentarios",
    timestamps: false
});

module.exports = Comentario;