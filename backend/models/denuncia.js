const { DataTypes } = require("sequelize");
const sequelize = require("./basededados");
const Utilizador = require("./Utilizador");
const forum_publicacoes = require("./forumPublicação");

const Denuncia = sequelize.define("Denuncia", {
    id_denuncia: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_denunciante: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Utilizador,
            key: "id_utilizador"
        }
    },
    id_publicacao: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: forum_publicacoes,
            key: "id_publicacao"
        }
    },
    texto_denuncia: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    meio_envio: {
        type: DataTypes.ENUM('email', 'formulario', 'app'),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pendente', 'em_analise', 'resolvida', 'rejeitada'),
        defaultValue: 'pendente'
    },
    data_criacao: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: "denuncias",
    timestamps: false
});

module.exports = Denuncia;