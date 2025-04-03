const {  DataTypes } = require("sequelize");
const sequelize = require("./basededados");
const Curso = require("./Curso")
const Utilizador = require("./Utilizador")


const Avaliacao = sequelize.define("Avaliacao", {
    id_avaliacao: { 
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
    nota: { 
        type: DataTypes.DECIMAL(5,2), 
        allowNull: false, 
        validate: {
            min: 0, max: 10 
        } 
    },
    data_avaliacao: { 
        type: DataTypes.DATE, 
    },
    comentarios: DataTypes.TEXT
}, { tableName: "Avaliacao", timestamps: false });

module.exports = Avaliacao;
