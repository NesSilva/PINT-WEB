const multer = require('multer');
const path = require('path');

// Define a pasta e o nome do ficheiro
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/forum');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + ext);
  }
});

// Aceitar apenas jpg/png
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Apenas imagens JPG/PNG são permitidas'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // Limite: 2MB
});

module.exports = upload;
