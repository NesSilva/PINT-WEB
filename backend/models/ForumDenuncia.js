const { DataTypes } = require('sequelize');
const sequelize = require('./basededados');
const ForumTopico = require('./ForumTopico');
const Utilizador = require('./Utilizador');

const ForumDenuncia = sequelize.define('ForumDenuncia', {
  id_denuncia: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
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
  motivo: { type: DataTypes.STRING(500), allowNull: false },
  data_denuncia: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'forum_denuncias',
  timestamps: false
});

module.exports = ForumDenuncia;
