const {DataTypes } = require("sequelize");
const sequelize = require("./basededados");
const Utilizador = require("./Utilizador")


const Notificacao = sequelize.define("Notificacao", {
    id_notificacao: { 
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
    mensagem: { 
        type: DataTypes.TEXT, 
        allowNull: false 
    },
    lida: { 
        type: DataTypes.BOOLEAN, 
        defaultValue: false 
    },
    data_criacao: { 
        type: DataTypes.DATE, 
    },
    tipo: { 
        type: DataTypes.STRING(20),
        defaultValue: "interna", 
        validate: { isIn: [["email", "push", "interna"]] } 
    }
}, { tableName: "Notificacao", timestamps: false });

module.exports = Notificacao;
