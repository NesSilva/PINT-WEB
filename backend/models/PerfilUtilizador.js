const { DataTypes } = require("sequelize");
const sequelize = require("./basededados");
const Utilizador = require("./Utilizador");
const Perfil = require("./Perfil")


const UtilizadorPerfil = sequelize.define("UtilizadorPerfil", {
    id_utilizador: { 
        type: DataTypes.INTEGER, 
        references: { 
            model: Utilizador, 
            key: "id_utilizador" 
        } 
    },
    id_perfil: { 
        type: DataTypes.INTEGER,
        references: {
            model: Perfil, 
            key: "id_perfil" 
        } 
    }
}, { tableName: "UtilizadorPerfil", timestamps: false });

module.exports = UtilizadorPerfil;

