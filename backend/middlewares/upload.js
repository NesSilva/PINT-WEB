const multer = require('multer');

const storage = multer.memoryStorage(); // Armazena o ficheiro na memória antes de enviar para o Firebase

const upload = multer({ storage });

module.exports = upload;
