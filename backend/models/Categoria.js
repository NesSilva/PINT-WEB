const { DataTypes } = require("sequelize");
const sequelize = require("./basededados");

const Categoria = sequelize.define("Categoria", {
    id_categoria: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true },
    nome: { 
        type: DataTypes.STRING(100), 
        allowNull: false, 
        unique: true },
    descricao: DataTypes.TEXT
}, { tableName: "Categoria", timestamps: false });

module.exports = Categoria;

