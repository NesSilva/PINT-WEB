const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("./basededados");
const Tipo_Utilizador = require("./Tipo_Utilizador"); // Importação do modelo relacionado

const Utilizador = sequelize.define("Utilizador", {
    ID_utilizador: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Nome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    Idade: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0 // Idade não pode ser negativa
        }
    },
    Email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    Palavra_passe: {
        type: DataTypes.STRING,
        allowNull: false
    },
    ID_tipo_Utilizador: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Tipo_Utilizador,
            key: 'ID_tipo_Utilizador'
        }
    }
}, {
    tableName: "utilizadores",
    timestamps: false
});


module.exports = Utilizador;
