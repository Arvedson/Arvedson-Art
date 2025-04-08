-- CreateTable
CREATE TABLE "StockArtwork" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "mainImageUrl" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "stockQuantity" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "medidas" TEXT,
    "tecnica" TEXT,
    "marco" TEXT,

    CONSTRAINT "StockArtwork_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockSubImage" (
    "id" SERIAL NOT NULL,
    "stockArtworkId" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockSubImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StockSubImage" ADD CONSTRAINT "StockSubImage_stockArtworkId_fkey" FOREIGN KEY ("stockArtworkId") REFERENCES "StockArtwork"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
