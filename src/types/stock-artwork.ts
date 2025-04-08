import { StockSubImage } from "@prisma/client";

export interface StockArtwork {
  id: number;
  title: string;
  description: string;
  mainImageUrl: string;
  width: number;
  height: number;
  price: number;
  stockQuantity: number;
  order: number;
  medidas: string | null;
  tecnica: string | null;
  marco: string | null;
  subImages: StockSubImage[];
}