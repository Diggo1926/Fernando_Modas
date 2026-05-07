const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Aceita qualquer arquivo cujo mimetype comece com 'image/'
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Apenas imagens são permitidas.'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter,
});

module.exports.uploadMiddleware = upload.single('foto');

// Valida o tipo real do arquivo via magic bytes (não confia no Content-Type do cliente)
module.exports.validarMime = (req, res, next) => {
  if (!req.file) return next();

  const buf = req.file.buffer;
  if (!buf || buf.length < 12) {
    return res.status(400).json({ erro: 'Arquivo de imagem inválido' });
  }

  const isJpeg = buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF;
  const isPng  = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47;
  const isGif  = buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38;
  const isWebp = buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP';

  if (!isJpeg && !isPng && !isGif && !isWebp) {
    return res.status(400).json({ erro: 'Formato de imagem não suportado. Use JPEG, PNG, GIF ou WEBP.' });
  }

  if (isJpeg)      req.file.mimeTypeReal = 'image/jpeg';
  else if (isPng)  req.file.mimeTypeReal = 'image/png';
  else if (isGif)  req.file.mimeTypeReal = 'image/gif';
  else             req.file.mimeTypeReal = 'image/webp';

  next();
};
