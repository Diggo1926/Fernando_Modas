// Middleware de upload com validação rigorosa de tipo MIME real
const multer = require('multer');
const { fileTypeFromBuffer } = require('file-type');

// Tipos MIME aceitos
const TIPOS_ACEITOS = ['image/jpeg', 'image/png', 'image/webp'];
const TAMANHO_MAXIMO = 5 * 1024 * 1024; // 5MB

// Armazena em memória para validar antes de enviar ao Cloudinary
const armazenamento = multer.memoryStorage();

const upload = multer({
  storage: armazenamento,
  limits: { fileSize: TAMANHO_MAXIMO },
  fileFilter: (_req, file, cb) => {
    // Verifica o MIME type declarado pelo cliente (verificação superficial)
    if (!TIPOS_ACEITOS.includes(file.mimetype)) {
      return cb(new Error('Tipo de arquivo não permitido. Envie apenas JPG, PNG ou WebP.'));
    }
    cb(null, true);
  },
});

// Middleware de validação real do MIME type (baseado no conteúdo binário)
async function validarMimeReal(req, res, next) {
  if (!req.file) return next();

  try {
    const tipo = await fileTypeFromBuffer(req.file.buffer);

    if (!tipo || !TIPOS_ACEITOS.includes(tipo.mime)) {
      return res.status(400).json({
        erro: 'O arquivo enviado não é uma imagem válida. Envie apenas JPG, PNG ou WebP.',
      });
    }

    // Armazena o tipo real verificado
    req.file.mimeTypeReal = tipo.mime;
    next();
  } catch {
    return res.status(400).json({ erro: 'Não foi possível verificar o arquivo enviado.' });
  }
}

module.exports = { upload, validarMimeReal };
