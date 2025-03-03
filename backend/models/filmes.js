const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("./basededados");

const Filme = sequelize.define("Filme", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    titulo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descricao: {
        type: DataTypes.STRING,
        allowNull: false
    },
    foto: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: "filmes",
    timestamps: false
});

module.exports = Filme;
