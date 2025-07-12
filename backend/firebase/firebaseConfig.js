const admin = require("firebase-admin");

// Obter a chave privada bruta da variável de ambiente
const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;
let privateKeyProcessed = null; // Inicializa como null para depuração

if (privateKeyRaw) {
  // Passo 1: Remover as aspas duplas externas se a string as contiver.
  // Isso é comum quando a variável é definida com aspas para agrupar o conteúdo.
  let cleanedKey = privateKeyRaw;
  if (privateKeyRaw.startsWith('"') && privateKeyRaw.endsWith('"')) {
    cleanedKey = privateKeyRaw.slice(1, -1);
  }
  
  // Passo 2: Substituir as sequências de escape de quebra de linha (\\n) por quebras de linha reais (\n).
  // O Render provavelmente armazena '\n' como '\\n' na variável de ambiente.
  privateKeyProcessed = cleanedKey.replace(/\\n/g, '\n');
} else {
  console.error("❌ ERRO: A variável de ambiente FIREBASE_PRIVATE_KEY não está definida!");
}

const firebaseConfig = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: privateKeyProcessed, // Usar a chave privada já processada
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN
};

try {
  // Verificação básica de credenciais antes de inicializar
  if (!firebaseConfig.private_key || !firebaseConfig.client_email || !firebaseConfig.project_id) {
    throw new Error("Configuração do Firebase incompleta - verifique as variáveis de ambiente necessárias (private_key, client_email, project_id).");
  }

  // --- LOGS DE DEPURAÇÃO CRUCIAIS ---
  console.log('DEBUG: private_key processada (início):', firebaseConfig.private_key?.substring(0, 50));
  console.log('DEBUG: private_key processada (fim):', firebaseConfig.private_key?.slice(-50));
  console.log('DEBUG: private_key processada (tamanho):', firebaseConfig.private_key?.length);
  console.log('DEBUG: private_key processada (contém \\n literais?):', firebaseConfig.private_key?.includes('\\n'));
  console.log('DEBUG: private_key processada (contém quebras de linha reais \n?):', firebaseConfig.private_key?.includes('\n'));
  console.log('DEBUG: private_key processada (é string e não nula?):', typeof firebaseConfig.private_key === 'string' && firebaseConfig.private_key !== 'null');
  // --- FIM DOS LOGS DE DEPURAÇÃO ---

  // Inicialização do Firebase Admin SDK
  admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });

  const bucket = admin.storage().bucket();
  
  // Teste de conexão com o Firebase Storage para verificar se a inicialização foi bem-sucedida
  bucket.getFiles({ maxResults: 1 })
    .then(() => console.log("✅ Conexão com Firebase Storage estabelecida com sucesso!"))
    .catch(err => console.error("❌ ERRO ao conectar com Firebase Storage (após inicialização bem-sucedida):", err));

  module.exports = { admin, bucket };

} catch (error) {
  // Captura erros durante a inicialização, incluindo os de credenciais inválidas
  console.error("❌ ERRO crítico na configuração/inicialização do Firebase:", error);
  // Garante que o processo Node.js saia com um erro
  process.exit(1); 
}
