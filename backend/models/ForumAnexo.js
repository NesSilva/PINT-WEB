const { DataTypes } = require("sequelize");
const sequelize = require("./basededados");
const ForumTopico = require("./ForumTopico");

const ForumAnexo = sequelize.define("ForumAnexo", {
    id_anexo: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_topico: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: ForumTopico,
            key: "id_topico"
        },
         onDelete: 'CASCADE'
    },
    nome_arquivo: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    caminho_arquivo: {
        type: DataTypes.STRING(512),
        allowNull: false
    },
    url: {
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
    is_imagem_principal: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    data_upload: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    is_imagem_principal: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
}, {
    tableName: "forum_anexos",
    timestamps: false
});

module.exports = ForumAnexo;