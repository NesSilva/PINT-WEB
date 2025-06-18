const { DataTypes } = require("sequelize");
const sequelize = require("./basededados");
const ForumPublicacao = require("./forumPublicação");

const ForumAnexo = sequelize.define("ForumAnexo", {
    id_anexo: {
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
    nome_arquivo: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    caminho_arquivo: {
        type: DataTypes.STRING(512),
        allowNull: false
    },
    url: {  // <-- Adicione este campo
        type: DataTypes.STRING(512),
        allowNull: false
    },
    tipo_arquivo: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    tamanho: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    data_upload: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: "forum_anexos",
    timestamps: false
});

module.exports = ForumAnexo;