const { DataTypes } = require('sequelize');
const sequelize = require('./basededados');
const ForumTopico = require('./ForumTopico');
const Utilizador = require('./Utilizador');

const ForumComentario = sequelize.define('ForumComentario', {
  id_comentario: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_topico: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: ForumTopico, key: 'id_topico' },
    onDelete: 'CASCADE'
  },
  conteudo: { type: DataTypes.TEXT, allowNull: false },
  imagem_url: { type: DataTypes.STRING, allowNull: true },
  id_utilizador: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  data_criacao: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'forum_comentarios',
  timestamps: false
});

// Associações
ForumComentario.belongsTo(ForumTopico, { foreignKey: 'id_topico', as: 'topico', onDelete: 'CASCADE' });
ForumComentario.belongsTo(Utilizador, { foreignKey: 'id_utilizador', as: 'autor' });

module.exports = ForumComentario;
