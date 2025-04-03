const { DataTypes } = require("sequelize");
const sequelize = require("./basededados");
const Utilizador = require("./Utilizador");
const Curso = require("./Curso")

const Inscricao = sequelize.define("Inscricao", {
    id_inscricao: { 
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
    data_inscricao: { 
        type: DataTypes.DATE, 
        },
    status: { 
        type: DataTypes.STRING(20), 
        defaultValue: "pendente", 
        validate: { 
            isIn: [["pendente", "confirmada", "cancelada"]] 
        } 
    }
}, { tableName: "Inscricao", timestamps: false });

module.exports = Inscricao;

