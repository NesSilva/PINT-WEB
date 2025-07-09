const { DataTypes } = require('sequelize');
const sequelize = require('./basededados');
const Categoria = require('./Categoria');
const Utilizador = require('./Utilizador');

const ForumTopico = sequelize.define('ForumTopico', {
  id_topico: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  titulo: { type: DataTypes.STRING(200), allowNull: false },
  conteudo: { type: DataTypes.TEXT, allowNull: false },
  imagem_url: { type: DataTypes.STRING, allowNull: true },
  id_categoria: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_categoria: {
              type: DataTypes.INTEGER, 
              references: { 
                  model: Categoria, 
                  key: "id_categoria" 
              } 
          },
  id_utilizador: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  data_criacao: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  valido: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'forum_topicos',
  timestamps: false
});

ForumTopico.belongsTo(Utilizador, { foreignKey: 'id_utilizador', as: 'autor' });
ForumTopico.belongsTo(Categoria, { foreignKey: 'id_categoria', as: 'categoria' });

module.exports = ForumTopico;