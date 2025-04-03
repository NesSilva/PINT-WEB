const { DataTypes } = require("sequelize");
const sequelize = require("./basededados");
const Curso = require("./Curso")

const ConteudoCurso = sequelize.define("ConteudoCurso", {
    id_conteudo: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    id_curso: { 
        type: DataTypes.INTEGER, 
        references: { 
            model: Curso, 
            key: "id_curso" 
        } 
    },
    tipo_conteudo: { 
        type: DataTypes.STRING(20), 
        validate: { 
            isIn: [["link", "ficheiro", "video", "dropbox"]] 
        } 
    },
    url: DataTypes.STRING(255),
    caminho_arquivo: DataTypes.STRING(255),
    descricao: DataTypes.TEXT
}, { tableName: "ConteudoCurso", timestamps: false });

module.exports = ConteudoCurso;
