const { DataTypes } = require("sequelize");
const sequelize = require("./basededados");
const Utilizador = require("./Utilizador")

const Mensagem = sequelize.define("Mensagem", {
    id_mensagem: { 
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_remetente: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Utilizador,
            key: "id_utilizador"
        }
    },
    id_destinatario: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Utilizador',
            key: "id_utilizador"
        }
    },
    mensagem: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    data_envio: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: "mensagens",
    timestamps: false
});

module.exports = Mensagem;