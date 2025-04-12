const express = require("express");
const router = express.Router();
const { getAdminDashboard ,getNumFormandos, getCursosPorMes} = require("../controllers/dashboardController");


router.get("/admin", getAdminDashboard);

router.get("/formandos", getNumFormandos);


router.get("/cursos/por-mes", getCursosPorMes);


module.exports = router;
