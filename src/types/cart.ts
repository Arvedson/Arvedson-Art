// types/cart.ts

// Interface for individual items in the cart
export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  type: 'artwork' | 'stock_artwork';
  imageUrl: string;
  metadata?: { // Optional metadata for the item, e.g., dimensions
    width: string;
    height: string;
  };
}

// Interface for customer contact information
export interface CustomerInfo {
  name?: string; // Optional customer name
  email?: string; // Optional customer email
  phone?: string; // Optional customer phone
}

// Interface for address information
export interface Address {
  street?: string; // Optional street address line 1
  city?: string; // Optional city
  state?: string; // Optional state or province
  postalCode?: string; // Optional postal or zip code
  country?: string; // Optional country
  formattedAddress?: string; // Added formattedAddress to match usage in components
  // You might also want to add location data if your AddressSection provides it
  location?: {
    lat: number;
    lng: number;
  };
  components?: { // Detailed address components
    route?: string;
    colony?: string;
    postalCode?: string;
    city?: string;
    state?: string;
    // Add other components as needed
  };
}

// Interface for the overall cart state
export interface CartState {
  items: CartItem[]; // Array of items in the cart
  address: Address | null; // Selected address, or null if none selected
  customer?: CustomerInfo; // Customer information, optional
  // Add other state properties related to the cart as needed (e.g., discount codes, etc.)
}

// Define the types of actions that can be dispatched to the cart reducer
export type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem } // Action to add an item to the cart
  | { type: 'REMOVE_ITEM'; payload: { id: number } } // Action to remove an item by id
  | { type: 'UPDATE_ITEM_QUANTITY'; payload: { id: number; quantity: number } } // Corrected action type name
  | { type: 'RESET_CART' } // Action to clear the entire cart
  | { type: 'UPDATE_ADDRESS'; payload: Address | null } // Action to update the address
  | { type: 'UPDATE_CUSTOMER'; payload: CustomerInfo | undefined }; // Action to update customer info
