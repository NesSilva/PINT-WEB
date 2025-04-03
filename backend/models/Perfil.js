const { DataTypes } = require("sequelize");
const sequelize = require("./basededados");

const Perfil = sequelize.define("Perfil", {
    id_perfil: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true },
    nome: { 
        type: DataTypes.STRING(50), 
        allowNull: false, unique: true, 
        validate: { 
            isIn: [["Administrador", "Formando", "Formador", "Gestor"]] 
        } 
    },
    descricao: DataTypes.TEXT
}, 
{ tableName: "Perfil", timestamps: false });

module.exports = Perfil;
