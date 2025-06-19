const { DataTypes } = require('sequelize');
const sequelize = require('./basededados');
const ForumTopico = require('./ForumTopico');
const Utilizador = require('./Utilizador');

const ForumAvaliacao = sequelize.define('ForumAvaliacao', {
  id_avaliacao: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_topico: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: ForumTopico, key: 'id_topico' }
  },
  id_utilizador: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Utilizador, key: 'id_utilizador' }
  },
  nota: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 }
  }
}, {
  tableName: 'forum_avaliacoes',
  timestamps: false
});

module.exports = ForumAvaliacao;
