const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "softinsa.appspot.com", // Nome do teu bucket de storage
});

const bucket = admin.storage().bucket();

module.exports = { admin, bucket };
