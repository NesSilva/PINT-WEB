const { DataTypes } = require("sequelize");
const sequelize = require("./basededados");
const Curso = require("./Curso")
const Utilizador = require("./Utilizador")

const Certificado = sequelize.define("Certificado", {
    id_certificado: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    id_utilizador: { 
        type: DataTypes.INTEGER, 
        references: { 
            model: Utilizador, 
            key: "id_utilizador" 
        } 
    },
    id_curso: { 
        type: DataTypes.INTEGER, 
        references: { 
            model: Curso, 
            key: "id_curso" 
        } 
    },
    data_emissao: { 
        type: DataTypes.DATE, 
    }
}, { tableName: "Certificado", timestamps: false });

module.exports = Certificado;

