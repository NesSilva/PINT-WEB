const { DataTypes } = require("sequelize");
const sequelize = require("./basededados");
const Curso = require("./Curso")
const Utilizador = require("./Utilizador")


const ProgressoCurso = sequelize.define("ProgressoCurso", {
    id_progresso: { 
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
    percentual_completo: { 
        type: DataTypes.DECIMAL(5,2), 
        defaultValue: 0, 
        validate: { min: 0, max: 100 } },
    nota_curso:{ 
        type: DataTypes.DECIMAL(5,2), 
        defaultValue: 0, 
        validate: { min: 0, max: 100 } },
        
    ultima_atualizacao: { 
        type: DataTypes.DATE, 
    }
}, { tableName: "ProgressoCurso", timestamps: false });

module.exports = ProgressoCurso;
