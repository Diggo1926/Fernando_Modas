-- AlterTable
ALTER TABLE "Produto" ADD COLUMN IF NOT EXISTS "codigo" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Produto_codigo_key" ON "Produto"("codigo");
