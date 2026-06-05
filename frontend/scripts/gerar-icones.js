const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const entrada = path.join(__dirname, '../public/logo-diva-modas.png');
const out = path.join(__dirname, '../public');
const outIcons = path.join(out, 'icons');

async function gerar() {
  if (!fs.existsSync(outIcons)) fs.mkdirSync(outIcons, { recursive: true });

  await sharp(entrada).resize(192, 192).png().toFile(path.join(outIcons, 'icon-192x192.png'));
  console.log('icons/icon-192x192.png gerado');

  await sharp(entrada).resize(512, 512).png().toFile(path.join(outIcons, 'icon-512x512.png'));
  console.log('icons/icon-512x512.png gerado');

  await sharp(entrada).resize(180, 180).flatten({ background: '#111111' }).png().toFile(path.join(out, 'apple-touch-icon.png'));
  console.log('apple-touch-icon.png gerado');

  await sharp(entrada).resize(32, 32).png().toFile(path.join(out, 'favicon.ico'));
  console.log('favicon.ico gerado');

  console.log('\nTodos os ícones gerados com sucesso!');
}

gerar().catch((err) => { console.error(err); process.exit(1); });
