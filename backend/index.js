const express = require("express");
const app = express();
const sequelize = require("./models/basededados");
const authRoutes = require("./routes/auth");
const passwordRoutes = require("./routes/passwordRoutes");

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

// Debug de variáveis de ambiente
console.log('teste-------------------------');
console.log(process.env.EMAIL_USER);
console.log(process.env.EMAIL_PASS);
console.log('teste-------------------------');

// Rotas principais
app.use("/", authRoutes);
app.use("/api/password", passwordRoutes);

const dashboardRoutes = require("./routes/dashboard");
app.use("/api/dashboard", dashboardRoutes);

const categoriaRoutes = require("./routes/routesCategoria");
app.use("/api", categoriaRoutes);

const areaFormacaoRoutes = require("./routes/areaFormacaoRoutes");
app.use("/api", areaFormacaoRoutes);

const utilizadorRoutes = require("./routes/utilizadoresRoutes");
app.use("/api/utilizadores", utilizadorRoutes);

app.post('/api/utilizadores/admin/aceitar-pedido', (req, res) => {
    const { id_utilizador, senha } = req.body;
    if (!id_utilizador || !senha) {
        return res.status(400).json({ message: "Parâmetros inválidos" });
    }
    return res.status(200).json({ message: "Pedido aceito com sucesso" });
});

const perfisRoutes = require("./routes/perfisRoutes");
app.use("/api/perfis", perfisRoutes);

const cursoRoutes = require("./routes/cursoRoutes");
app.use("/api/cursos", cursoRoutes);

const conteudoRoutes = require("./routes/conteudoCursoRoutes");
app.use("/api/conteudo", conteudoRoutes);

// --- NOVAS ROTAS DO FÓRUM ---
const forumTopicoRoutes = require('./routes/forumTopico');
const forumComentarioRoutes = require('./routes/forumComentario');
app.use('/api/forum/topico', forumTopicoRoutes);
app.use('/api/forum/comentario', forumComentarioRoutes);

// Servir imagens dos uploads (deixa isso depois de todas as rotas)
app.use('/uploads/forum', express.static('uploads/forum'));

const inscricaoRoutes = require("./routes/inscricaoRoutes");
app.use("/api/inscricoes", inscricaoRoutes);

const notificacaoRoutes = require("./routes/noticacoesRoute");
app.use("/api/notificacoes", notificacaoRoutes);


app.get("/", (req, res) => {
    res.send("Bem-vindo à API de Filmes");
});

// Sequelize sync
sequelize.sync({
    force: false,
    alter: true,
    logging: console.log,
});

app.listen(app.get("port"), "0.0.0.0", () => {
    console.log(`Server running on port ${app.get("port")}`);
});

module.exports = app;
