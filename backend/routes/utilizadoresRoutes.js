const express = require("express");
const router = express.Router();
const utilizadoresController = require("../controllers/utilizadoresController");

router.get("/utilizadores", utilizadoresController.listarUtilizadores);
router.delete("/utilizadores/:id_utilizador", utilizadoresController.eliminarUtilizador);
router.put("/utilizadores/:id_utilizador", utilizadoresController.editarUtilizador);
router.post("/utilizadores", utilizadoresController.criarUtilizador);



module.exports = router;
