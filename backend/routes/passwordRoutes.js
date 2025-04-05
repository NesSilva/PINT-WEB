const express = require("express");
const router = express.Router();
const { requestPasswordReset, resetPassword,updateFirstLoginPassword } = require("../controllers/resetPasswordController");

const { sendRecoveryEmail } = require('../emailService'); 

router.post('/reset-password-request', requestPasswordReset);

router.post("/reset-password", resetPassword);

router.post("/first-login", updateFirstLoginPassword);

module.exports = router;
