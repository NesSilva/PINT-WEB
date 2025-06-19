// middleware/auth.js

// Exemplo básico: pega perfil do user do req.user (ajuste conforme teu sistema)
function isGestor(req, res, next) {
  // Simulação: se não houver sistema de perfil, libera geral
  if (!req.user || !req.user.perfil) {
    // Se não tens ainda, usa um perfil fake só para testes!
    req.user = { perfil: 'Gestor', id_utilizador: 1 }; // Remova isso depois
  }

  if (req.user.perfil === 'Gestor') {
    return next();
  }
  return res.status(403).json({ success: false, message: "Apenas gestores podem criar tópicos" });
}

module.exports = { isGestor };
