// models/ForumComentarioAnexo.js
const { DataTypes } = require('sequelize');
const sequelize = require('./basededados');
const ForumComentario = require('./ForumComentario');

const ForumComentarioAnexo = sequelize.define('ForumComentarioAnexo', {
    id_anexo: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_comentario: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: ForumComentario,
            key: "id_comentario"
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
    data_upload: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: "forum_comentario_anexos",
    timestamps: false
});

// Associações
ForumComentarioAnexo.belongsTo(ForumComentario, { 
    foreignKey: 'id_comentario',
    onDelete: 'CASCADE'
});

module.exports = ForumComentarioAnexo;