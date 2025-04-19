// types/cart.ts
export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  metadata?: {
    width: string;
    height: string;
  };
}


export interface CustomerInfo {
  name?: string;
  email?: string;
  phone?: string;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface CartState {
  items: CartItem[];
  address: Address | null;
  customer?: CustomerInfo;
}

export type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { id: number } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: number; quantity: number } }
  | { type: 'RESET_CART' }
  | { type: 'UPDATE_ADDRESS'; payload: Address | null }
  | { type: 'UPDATE_CUSTOMER'; payload: CustomerInfo | undefined };