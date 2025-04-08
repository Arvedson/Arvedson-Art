// types.ts
export interface Artwork {
  id: string;
  title: string;
  mainImageUrl: string;
}

export interface Address {
  formattedAddress: string;
  location: { lat: number; lng: number } | null;
  components: {
    streetNumber?: string;
    route?: string;
    colony?: string;
    postalCode?: string;
    city?: string;
    state?: string;
  };
}

export interface OrderInfo {
  artworkTitle: string;
  artworkId: string;
  totalPrice: number;
  email: string;
  phone: string;
  address: Address | null;
}


