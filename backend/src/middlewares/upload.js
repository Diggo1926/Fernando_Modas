const multer = require('multer');
const { fileTypeFromBuffer } = require('file-type');

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports.uploadMiddleware = upload.single('foto');

module.exports.validarMime = async (req, res, next) => {
  if (!req.file || !req.file.buffer || req.file.buffer.length === 0) {
    return next();
  }

  try {
    const tipo = await fileTypeFromBuffer(req.file.buffer);
    const permitidos = ['image/jpeg', 'image/png', 'image/webp'];

    if (!tipo || !permitidos.includes(tipo.mime)) {
      return res.status(400).json({
        erro: 'Tipo de arquivo não permitido. Use JPG, PNG ou WebP.',
      });
    }

    req.file.mimeTypeReal = tipo.mime;
    next();
  } catch (error) {
    return res.status(400).json({
      erro: 'Não foi possível verificar o arquivo enviado.',
    });
  }
};
