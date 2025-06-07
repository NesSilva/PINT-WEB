// config.js
const fs        = require('fs');
const path      = require('path');
const Sequelize = require('sequelize');

const DB_NAME = 'pint';
const DB_USER = 'avnadmin';
const DB_PASS = 'AVNS_0dRXW1jAWGD63pNyiKq';
const DB_HOST = 'pg-pint-jmvbeselga-d39c.e.aivencloud.com';
const DB_PORT = 11754;

const CA_CERT_PATH = path.join(__dirname, 'aiven-ca.crt');


const caCert = fs.readFileSync(CA_CERT_PATH).toString();

const sequelize = new Sequelize(
  DB_NAME,
  DB_USER,
  DB_PASS,
  {
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'postgres',
    pool: {
      max: 20,       
      min: 0,
      idle: 10000
    },
    dialectOptions: {
      ssl: {
        require: true,           
        rejectUnauthorized: true,
        ca: caCert               
      }
    },
   
  }
);

module.exports = sequelize;
