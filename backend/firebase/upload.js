// firebase/upload.js
const multer = require('multer');
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Aceita qualquer campo de arquivo chamado 'file' ou 'ficheiro'
    if (file.fieldname === 'file' || file.fieldname === 'ficheiro') {
      cb(null, true);
    } else {
      cb(new Error('Unexpected field'), false);
    }
  }
});

module.exports = upload;