var Sequelize = require('sequelize');
var sequelize = new Sequelize(
    'bd_pint',
    'postgres',
    'ines27ma',
    {
        host: 'localhost',
        port: 5432,
        dialect: 'postgres'
    }
);

module.exports = sequelize;
