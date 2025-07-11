const admin = require("firebase-admin");

// Configuração para produção (Render.com)
const firebaseConfig = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN
};

try {
  // Verificação das credenciais
  if (!firebaseConfig.private_key || !firebaseConfig.client_email) {
    throw new Error("Configuração do Firebase incompleta - verifique as variáveis de ambiente");
  }

  // Inicialização do Firebase
  admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });

  const bucket = admin.storage().bucket();
  
  // Teste de conexão
  bucket.getFiles({ maxResults: 1 })
    .then(() => console.log("✅ Conexão com Firebase Storage estabelecida com sucesso"))
    .catch(err => console.error("❌ Erro ao conectar com Firebase Storage:", err));

  module.exports = { admin, bucket };

} catch (error) {
  console.error("❌ Erro crítico na configuração do Firebase:", error);
  process.exit(1);
}
