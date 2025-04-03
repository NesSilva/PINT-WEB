const { DataTypes } = require("sequelize");
const sequelize = require("./basededados");
const Categoria = require("./Categoria")

const AreaFormacao = sequelize.define("AreaFormacao", {
    id_area: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true },
    id_categoria: { 
        type: DataTypes.INTEGER, 
        references: { 
            model: Categoria, 
            key: "id_categoria" 
        } 
    },
    nome: { 
        type: DataTypes.STRING(100), 
        allowNull: false 
    },
    descricao: DataTypes.TEXT
}, { tableName: "AreaFormacao", timestamps: false });

module.exports = AreaFormacao;
