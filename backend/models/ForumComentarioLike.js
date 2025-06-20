// backend/models/ForumComentarioLike.js
const { DataTypes } = require('sequelize');
const sequelize = require('./basededados');
const ForumComentario = require('./ForumComentario');
const Utilizador = require('./Utilizador');

const ForumComentarioLike = sequelize.define('ForumComentarioLike', {
  id_like: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_comentario: { type: DataTypes.INTEGER, allowNull: false },
  id_utilizador: { type: DataTypes.INTEGER, allowNull: false }
}, {
  tableName: 'forum_comentario_likes',
  timestamps: false
});

ForumComentarioLike.belongsTo(ForumComentario, { foreignKey: 'id_comentario', as: 'comentario' });
ForumComentarioLike.belongsTo(Utilizador, { foreignKey: 'id_utilizador', as: 'utilizador' });

module.exports = ForumComentarioLike;
