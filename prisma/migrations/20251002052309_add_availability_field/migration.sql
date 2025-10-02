-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_orderId_fkey";

-- AlterTable
ALTER TABLE "Artwork" ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "StockArtwork" ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT true;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
