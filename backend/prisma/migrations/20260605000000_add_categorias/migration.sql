-- CreateTable
CREATE TABLE "categorias" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "sigla" TEXT NOT NULL,
    "temTamanhoUnico" BOOLEAN NOT NULL DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categorias_nome_key" ON "categorias"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_sigla_key" ON "categorias"("sigla");

-- Seed das categorias padrão
INSERT INTO "categorias" ("nome", "sigla", "temTamanhoUnico") VALUES
    ('Vestido', 'VES', true),
    ('Blusa', 'BLU', true),
    ('Calça', 'CAL', false),
    ('Saia', 'SAI', false),
    ('Conjunto', 'CNJ', false),
    ('Acessório', 'ACS', false),
    ('Body', 'BDY', false),
    ('Boddy', 'BOD', true),
    ('Cropped', 'CRP', true),
    ('Calça de Alfaiataria', 'CAF', false),
    ('Short de Alfaiataria', 'SAF', false),
    ('Camisa de Alfaiataria', 'CMF', false),
    ('Vestido de Alfaiataria', 'VAF', false),
    ('Calça Jeans', 'JNS', false),
    ('Short Jeans', 'SJN', false),
    ('Short Jeans Cargo', 'SJC', false),
    ('Calça Jeans Cargo', 'CJC', false),
    ('Calça Flare', 'FLR', false),
    ('Outro', 'OUT', false);
