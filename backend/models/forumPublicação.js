const { DataTypes } = require("sequelize");
const sequelize = require("./basededados");
const Utilizador = require("./Utilizador");
const Categoria = require("./Categoria"); // ou Area, dependendo do design
const ForumPublicacao = sequelize.define("ForumPublicacao", {
    id_publicacao: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_autor: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Utilizador,
            key: "id_utilizador"
        }
    },
    id_categoria: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: Categoria, // ou Area, dependendo do design
        key: "id_categoria"
    }
    },
    titulo: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    conteudo: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    data_publicacao: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: "forum_publicacoes",
    timestamps: false
});

module.exports = ForumPublicacao;