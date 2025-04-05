const express = require("express");
const router = express.Router();
const { requestPasswordReset, resetPassword } = require("../controllers/resetPasswordController");

const { sendRecoveryEmail } = require('../emailService'); 

router.post('/reset-password-request', requestPasswordReset);

router.post("/reset-password", resetPassword);

module.exports = router;
