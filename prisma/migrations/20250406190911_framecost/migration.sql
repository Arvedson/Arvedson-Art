-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('CUSTOM_ARTWORK', 'STOCK_ARTWORK', 'REPLICA_ARTWORK');

-- CreateTable
CREATE TABLE "FramePrice" (
    "id" SERIAL NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,

    CONSTRAINT "FramePrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FramePrice_width_height_key" ON "FramePrice"("width", "height");
