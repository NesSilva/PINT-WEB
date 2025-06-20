const express = require("express");
const router = express.Router();
const { listarNotificacoes, marcarComoLida } = require("../controllers/notificaçõesController");

router.get("/notificacoes/:id_utilizador", listarNotificacoes);
router.put("/notificacao/:id_notificacao/lida", marcarComoLida);

module.exports = router;
