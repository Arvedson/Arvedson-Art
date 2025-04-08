// Contexto del Carrito actualizado
"use client";
import { Address } from '../types/types'
import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
   metadata?: {  // ← Agregar este campo
      width: string;
     height: string;
   };
}


interface CustomerInfo {
  email?: string;
  phone?: string;
}

interface CartState {
  items: CartItem[];
  address: Address | null;
  customer?: CustomerInfo;
}

type Action =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { id: number } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: number; quantity: number } }
  | { type: 'RESET_CART' }
  | { type: 'UPDATE_ADDRESS'; payload: Address | null }
  | { type: 'UPDATE_CUSTOMER'; payload: CustomerInfo | undefined };

const initialState: CartState = {
  items: [],
  address: null,
  customer: undefined
};

function cartReducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }],
      };
    }
    case 'REMOVE_ITEM': {
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.id),
      };
    }
    case 'UPDATE_QUANTITY': {
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    }
    case 'RESET_CART':
      return { ...initialState };
    case 'UPDATE_ADDRESS':
      return { ...state, address: action.payload || null };
    case 'UPDATE_CUSTOMER':
      return { ...state, customer: action.payload };
    default:
      return state;
  }
}

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => null,
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}