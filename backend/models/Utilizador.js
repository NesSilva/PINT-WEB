
const {Sequelize,DataTypes } = require("sequelize");
const sequelize = require("./basededados");

const Utilizador = sequelize.define("Utilizador", {
    id_utilizador: { 
        type: DataTypes.INTEGER,
        primaryKey: true, 
        autoIncrement: true 
    },
    
    nome: { 
        type: DataTypes.STRING(100), 
        allowNull: false 
    },
    email: { 
        type: DataTypes.STRING(100), 
        allowNull: false, 
        unique: true },
    senha: { 
        type: DataTypes.STRING(255), 
        allowNull: false
    },
    morada:{
        type: DataTypes.STRING(255),
    },
    telefone:{
        type: DataTypes.STRING(20),
    },
    criado_em: { 
        type: DataTypes.DATE, 
        defaultValue: Sequelize.NOW 
    },
    resetCode: {
        type: DataTypes.STRING,  
        allowNull: true,
    },
    resetCodeExpiry: {
        type: DataTypes.DATE, 
        allowNull: true,
    },
    primeiroLogin: {
        type: DataTypes.INTEGER, 
        allowNull: true,
    },
},
 { 
    tableName: "Utilizador",
     timestamps: false 
    });



module.exports = Utilizador;
