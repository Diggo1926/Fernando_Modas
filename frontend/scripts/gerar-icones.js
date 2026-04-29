const sharp = require('sharp');
const path = require('path');

const svg = path.join(__dirname, '../public/logo.svg');
const out = path.join(__dirname, '../public');

async function gerar() {
  await sharp(svg).resize(192, 192).png().toFile(path.join(out, 'icon-192.png'));
  console.log('icon-192.png gerado');

  await sharp(svg).resize(512, 512).png().toFile(path.join(out, 'icon-512.png'));
  console.log('icon-512.png gerado');

  await sharp(svg).resize(180, 180).flatten({ background: '#111111' }).png().toFile(path.join(out, 'apple-touch-icon.png'));
  console.log('apple-touch-icon.png gerado');

  await sharp(svg).resize(32, 32).png().toFile(path.join(out, 'favicon.ico'));
  console.log('favicon.ico gerado');

  console.log('\nTodos os ícones gerados com sucesso!');
}

gerar().catch((err) => { console.error(err); process.exit(1); });
