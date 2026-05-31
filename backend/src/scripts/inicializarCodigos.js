// Script de inicialização: adiciona coluna codigo ao banco e migra produtos existentes.
// Idempotente — pode rodar em todo start sem risco de duplicar dados.
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const SIGLAS = {
  'Vestido': 'VES',
  'Blusa': 'BLU',
  'Calça': 'CAL',
  'Saia': 'SAI',
  'Conjunto': 'CNJ',
  'Acessório': 'ACS',
  'Body': 'BOD',
  'Boddy': 'BOD',
  'Cropped': 'CRP',
  'Calça de Alfaiataria': 'CAF',
  'Short de Alfaiataria': 'SAF',
  'Camisa de Alfaiataria': 'CMF',
  'Vestido de Alfaiataria': 'VAF',
  'Calça Jeans': 'JNS',
  'Short Jeans': 'SJN',
  'Short Jeans Cargo': 'SJC',
  'Calça Jeans Cargo': 'CJC',
  'Calça Flare': 'FLR',
  'Outro': 'OUT',
};

async function adicionarColuna() {
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Produto"
    ADD COLUMN IF NOT EXISTS "codigo" TEXT;
  `);
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE tablename = 'Produto' AND indexname = 'Produto_codigo_key'
      ) THEN
        CREATE UNIQUE INDEX "Produto_codigo_key" ON "Produto"("codigo");
      END IF;
    END $$;
  `);
}

async function migrarCodigos() {
  const semCodigo = await prisma.$queryRawUnsafe(`
    SELECT id, categoria FROM "Produto"
    WHERE "codigo" IS NULL AND "ativo" = true
    ORDER BY "createdAt" ASC
  `);

  if (semCodigo.length === 0) return;

  const porSigla = {};
  for (const p of semCodigo) {
    const sigla = SIGLAS[p.categoria] || 'OUT';
    if (!porSigla[sigla]) porSigla[sigla] = [];
    porSigla[sigla].push(p);
  }

  for (const [sigla, lista] of Object.entries(porSigla)) {
    const existentes = await prisma.$queryRawUnsafe(`
      SELECT "codigo" FROM "Produto"
      WHERE "codigo" LIKE '${sigla}-%'
    `);

    let maxNum = 0;
    for (const row of existentes) {
      const match = row.codigo?.match(/^[A-Z]+-(\d+)$/);
      if (match) {
        const n = parseInt(match[1], 10);
        if (n > maxNum) maxNum = n;
      }
    }

    let contador = maxNum + 1;
    for (const produto of lista) {
      const codigo = `${sigla}-${String(contador).padStart(3, '0')}`;
      await prisma.$executeRawUnsafe(
        `UPDATE "Produto" SET "codigo" = $1 WHERE "id" = $2`,
        codigo,
        produto.id
      );
      console.log(`  ID ${produto.id} → ${codigo}`);
      contador++;
    }
  }

  console.log(`inicializarCodigos: ${semCodigo.length} produto(s) receberam código.`);
}

async function main() {
  console.log('inicializarCodigos: verificando coluna...');
  await adicionarColuna();
  console.log('inicializarCodigos: migrando produtos sem código...');
  await migrarCodigos();
  console.log('inicializarCodigos: concluído.');
}

main()
  .catch((err) => { console.error('inicializarCodigos ERRO:', err.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
