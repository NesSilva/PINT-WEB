const {DataTypes} = require("sequelize");
const sequelize = require("./basededados");
const Utilizador = require("./Utilizador");
const Categoria = require("./Categoria");
const AreaFormacao = require("./AreaFormacao");
const { all } = require("../routes/areaFormacaoRoutes");

const Curso = sequelize.define("Curso", {
    id_curso: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    titulo: { 
        type: DataTypes.STRING(200), 
        allowNull: false 
    },
    descricao: DataTypes.TEXT,
    id_categoria: {
        type: DataTypes.INTEGER, 
        references: { 
            model: Categoria, 
            key: "id_categoria" 
        } 
    },
    id_area: { 
        type: DataTypes.INTEGER, 
        references: { 
            model: AreaFormacao, 
            key: "id_area" 
        } 
    },
    id_formador: { 
        type: DataTypes.INTEGER,
        allowNull: true,  
        references: { 
            model: Utilizador, 
            key: "id_utilizador" 
        } 
    },
    descricao_formador: {  
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Descrição sobre o formador para os alunos"
    },
    data_inicio: DataTypes.DATE,
    data_fim: DataTypes.DATE,
    vagas: { 
        type: DataTypes.INTEGER,
        allowNull: true, 
        defaultValue: null, 
        validate: { 
            min: 1 
        } 
    },
    tipo: { 
         type: DataTypes.STRING(20), 
        allowNull: false, 
        defaultValue: "assincrono", // Valor padrão
        validate: { 
            isIn: [["sincrono", "assincrono"]] 
        } 
    },
    estado: { 
        type: DataTypes.STRING(20), 
        defaultValue: "agendado", 
        validate: { 
            isIn: [["agendado", "em_curso", "terminado"]] 
        } 
    }
}, { tableName: "Curso", timestamps: false });

module.exports = Curso;