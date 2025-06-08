const express = require("express");
const router = express.Router();
const utilizadoresController = require("../controllers/utilizadoresController");
const Utilizador = require("../models/Utilizador");

router.get("/utilizadores", utilizadoresController.listarUtilizadores);
router.delete("/utilizadores/:id_utilizador", utilizadoresController.eliminarUtilizador);
router.put("/utilizadores/:id_utilizador", utilizadoresController.editarUtilizador);
router.post("/utilizadores", utilizadoresController.criarUtilizador);
router.put("/pedido/:id_utilizador", utilizadoresController.atualizarPedidoAceite);
router.post("/admin/aceitar-pedido", utilizadoresController.aceitarPedidoConta);

router.post("/solicitar", async (req, res) => {
  const { email, numeroColaborador } = req.body;

  if (!email || !numeroColaborador) {
    return res.status(400).json({ message: "Email e número de colaborador são obrigatórios." });
  }

  try {
    const existente = await Utilizador.findOne({ where: { email } });

    if (existente) {
      return res.status(400).json({ message: "Já existe uma conta com este email." });
    }

    const novoUtilizador = await Utilizador.create({
      email,
      numeroColaborador,
      pedidoAceitoSN: 0,
      senha: null,
      nome: "Pendente", 
    });

    res.status(201).json({ message: "Pedido enviado com sucesso.", utilizador: novoUtilizador });
  } catch (error) {
    console.error("Erro ao solicitar conta:", error);
    res.status(500).json({ message: "Erro interno ao solicitar conta." });
  }
});



module.exports = router;
