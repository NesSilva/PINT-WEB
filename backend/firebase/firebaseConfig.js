const admin = require("firebase-admin");
const serviceAccount = require("./softinsapdm2-firebase-adminsdk-fjwws-c031a9b71d.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "softinsapdm2.appspot.com", // Nome do teu bucket de storage
});

const bucket = admin.storage().bucket();

module.exports = { admin, bucket };
