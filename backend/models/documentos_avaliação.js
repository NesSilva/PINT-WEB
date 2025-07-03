const { DataTypes } = require("sequelize");
const sequelize = require("./basededados");
const Curso = require("./Curso")
const Utilizador = require("./Utilizador");

const documento_avaliacao = sequelize.define("documento_avaliacao", {
    id_Doc_Avaliacao: { 
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
     id_utilizador: { 
        type: DataTypes.INTEGER, 
        references: { 
            model: Utilizador, 
            key: "id_utilizador" 
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

module.exports = documento_avaliacao;
