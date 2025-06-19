const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("./basededados");

const Tipo_Utilizador = sequelize.define("Tipo_Utilizador", {
    ID_tipo_Utilizador: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Descricao_Tipo_Utilizador: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: "tipo_utilizadores",
    timestamps: false
});

module.exports = Tipo_Utilizador;
