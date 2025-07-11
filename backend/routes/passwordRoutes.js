const express = require("express");
const router = express.Router();
const { requestPasswordReset, resetPassword,updateFirstLoginPassword } = require("../controllers/resetPasswordController");

const { sendRecoveryEmail } = require('../emailService'); 

router.post('/reset-password-request', requestPasswordReset);

router.post("/reset-password", resetPassword);

router.post("/first-login", updateFirstLoginPassword);

router.post('/api/first-login-email', async (req, res) => {
  try {
    const { email } = req.body;
    await sendFirstLoginEmail(email);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Falha ao enviar e-mail" });
  }
});

module.exports = router;
