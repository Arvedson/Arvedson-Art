/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Artwork` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Artwork` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[order]` on the table `Artwork` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `mainImageUrl` to the `Artwork` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order` to the `Artwork` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Artwork" DROP COLUMN "imageUrl",
DROP COLUMN "price",
ADD COLUMN     "mainImageUrl" TEXT NOT NULL,
ADD COLUMN     "order" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "SubImage" (
    "id" SERIAL NOT NULL,
    "artworkId" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Artwork_order_key" ON "Artwork"("order");

-- AddForeignKey
ALTER TABLE "SubImage" ADD CONSTRAINT "SubImage_artworkId_fkey" FOREIGN KEY ("artworkId") REFERENCES "Artwork"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
