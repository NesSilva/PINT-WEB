const admin = require("firebase-admin");

const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;
let privateKeyProcessed;

if (privateKeyRaw) {
  // Remover as aspas duplas externas se existirem (alguns ambientes adicionam)
  let cleanedKey = privateKeyRaw.startsWith('"') && privateKeyRaw.endsWith('"')
                   ? privateKeyRaw.slice(1, -1)
                   : privateKeyRaw;

  // Substituir \\n por \n (se o ambiente os estiver a escapar)
  privateKeyProcessed = cleanedKey.replace(/\\n/g, '\n');
} else {
  console.error("FIREBASE_PRIVATE_KEY não está definida nas variáveis de ambiente!");
}

const firebaseConfig = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: privateKeyProcessed, // Usar a chave processada
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN
};

try {
  if (!firebaseConfig.private_key || !firebaseConfig.client_email) {
    throw new Error("Configuração do Firebase incompleta - verifique as variáveis de ambiente");
  }

  // Adicione os console.log de depuração aqui, com a chave processada
  console.log('DEBUG: private_key processada (primeiras 50 chars):', firebaseConfig.private_key?.substring(0, 50));
  console.log('DEBUG: private_key processada (últimas 50 chars):', firebaseConfig.private_key?.slice(-50));
  console.log('DEBUG: private_key processada (tamanho):', firebaseConfig.private_key?.length);
  console.log('DEBUG: private_key processada (contém \\n):', firebaseConfig.private_key?.includes('\\n'));
  console.log('DEBUG: private_key processada (contém \n):', firebaseConfig.private_key?.includes('\n'));
  console.log('DEBUG: private_key processada (é string?):', typeof firebaseConfig.private_key === 'string');


  admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });

  const bucket = admin.storage().bucket();

  bucket.getFiles({ maxResults: 1 })
    .then(() => console.log("✅ Conexão com Firebase Storage estabelecida com sucesso"))
    .catch(err => console.error("❌ Erro ao conectar com Firebase Storage:", err));

  module.exports = { admin, bucket };

} catch (error) {
  console.error("❌ Erro crítico na configuração do Firebase:", error);
  process.exit(1);
}
