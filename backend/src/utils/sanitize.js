// Utilitário de sanitização de strings contra XSS e injeção

function sanitizarString(valor) {
  if (typeof valor !== 'string') return valor;
  return valor
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

function sanitizarObjeto(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const resultado = {};
  for (const chave of Object.keys(obj)) {
    if (typeof obj[chave] === 'string') {
      resultado[chave] = sanitizarString(obj[chave]);
    } else if (typeof obj[chave] === 'object' && obj[chave] !== null) {
      resultado[chave] = sanitizarObjeto(obj[chave]);
    } else {
      resultado[chave] = obj[chave];
    }
  }
  return resultado;
}

module.exports = { sanitizarString, sanitizarObjeto };
