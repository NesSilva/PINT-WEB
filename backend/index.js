const express = require("express");
const app = express();
const sequelize = require("./models/basededados");
const authRoutes = require("./routes/auth");
const passwordRoutes = require("./routes/passwordRoutes"); // Importando as rotas de reset de senha


// Configurações básicas
app.set("port", process.env.PORT || 3000);

// Middlewares
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method"
    );
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    res.header("Allow", "GET, POST, OPTIONS, PUT, DELETE");
    next();
});

const cors = require("cors");
app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

require('dotenv').config();  // Carrega as variáveis do arquivo .env

console.log('teste-------------------------');  // Deverá mostrar o seu email

// Verificando se as variáveis de ambiente estão carregadas
console.log(process.env.EMAIL_USER);  // Deverá mostrar o seu email
console.log(process.env.EMAIL_PASS);  // Deverá mostrar a sua senha de aplicativo
console.log('teste-------------------------');  // Deverá mostrar o seu email

// index.js (ou seu arquivo principal)
app.use(express.json()); // Isso deve estar ANTES das rotas
app.use(express.urlencoded({ extended: true }));


app.use("/", authRoutes);

app.use("/api/password", passwordRoutes); 


const dashboardRoutes = require("./routes/dashboard");
app.use("/api/dashboard", dashboardRoutes);

const utilizadorRoutes = require("./routes/utilizadoresRoutes");
app.use("/api/utilizadores", utilizadorRoutes);



const perfisRoutes = require("./routes/perfisRoutes");
app.use("/api/perfis", perfisRoutes);

const cursoRoutes = require("./routes/cursoRoutes");

app.use("/api/cursos", cursoRoutes);


const conteudoRoutes = require("./routes/conteudoCursoRoutes");
app.use("/api/conteudo", conteudoRoutes);


app.get("/", (req, res) => {
    res.send("Bem-vindo à API de Filmes");
});

sequelize.sync({
    force: false,
    alter: true,
    logging: console.log,
});

app.listen(3000, "0.0.0.0", () => {
    console.log("Server running on port 3000");
});

module.exports = app;
