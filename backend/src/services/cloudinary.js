// Serviço de upload para o Cloudinary com retry e backoff exponencial
const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const TENTATIVAS_MAXIMAS = 3;
const DELAY_BASE_MS = 500;

function aguardar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Faz upload de um buffer para o Cloudinary.
 * Retorna { url, publicId } para armazenar ambos no banco.
 */
async function enviarImagem(buffer, mimeType) {
  const publicId = `a-bella-modas/${uuidv4()}`;

  for (let tentativa = 1; tentativa <= TENTATIVAS_MAXIMAS; tentativa++) {
    try {
      const resultado = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            public_id: publicId,
            resource_type: 'image',
            format: mimeType === 'image/webp' ? 'webp' : mimeType === 'image/png' ? 'png' : 'jpg',
            overwrite: true,
            transformation: [
              { width: 800, height: 800, crop: 'limit', quality: 'auto:good' },
            ],
          },
          (erro, resultado) => {
            if (erro) return reject(erro);
            resolve(resultado);
          }
        );

        const readable = new Readable();
        readable.push(buffer);
        readable.push(null);
        readable.pipe(stream);
      });

      return { url: resultado.secure_url, publicId: resultado.public_id };
    } catch (erro) {
      logger.warn({ tentativa, erro: erro.message }, 'Falha ao enviar imagem para Cloudinary');

      if (tentativa === TENTATIVAS_MAXIMAS) {
        throw new Error('Não foi possível enviar a imagem após várias tentativas.');
      }

      await aguardar(DELAY_BASE_MS * Math.pow(2, tentativa - 1));
    }
  }
}

/**
 * Remove uma imagem do Cloudinary pelo publicId armazenado no banco.
 */
async function removerImagem(publicId) {
  try {
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId);
  } catch (erro) {
    logger.warn({ erro: erro.message }, 'Falha ao remover imagem do Cloudinary');
  }
}

module.exports = { enviarImagem, removerImagem };
