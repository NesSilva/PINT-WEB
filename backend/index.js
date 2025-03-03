const express = require('express');
const app = express();
const sequelize = require('./models/basededados');
const filmeRoute = require('./routes/filmesRoute');
const authRoutes = require("./routes/auth");

// Configurações básicas
app.set('port', process.env.PORT || 3000);

// Middlewares
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

const cors = require('cors');
app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use('/',authRoutes);

app.use('/filmes', filmeRoute);

app.get('/', (req, res) => {
    res.send('Bem-vindo à API de Filmes');
});

sequelize.sync({
    force: false, 
    alter: true,  
    logging: console.log
  });

  app.listen(3000, '0.0.0.0', () => {
    console.log('Server running on port 3000');
  });
  
module.exports = app;