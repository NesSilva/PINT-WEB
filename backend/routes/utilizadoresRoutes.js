const express = require("express");
const router = express.Router();
const utilizadoresController = require("../controllers/utilizadoresController");

router.get("/utilizadores", utilizadoresController.listarUtilizadores);
router.delete("/utilizadores/:id_utilizador", utilizadoresController.eliminarUtilizador);


module.exports = router;
