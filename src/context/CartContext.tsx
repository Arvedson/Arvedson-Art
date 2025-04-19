// Contexto del Carrito actualizado
"use client";

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { CartState, CartAction } from '../types/cart';

const initialState: CartState = {
  items: [],
  address: null,
  customer: undefined,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      console.log('Adding item:', action.payload); // Log del producto añadido
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        const newState = {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
        console.log('Updated state after ADD_ITEM:', newState); // Log del estado actualizado
        return newState;
      }
      const newState = {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }],
      };
      console.log('Updated state after ADD_ITEM:', newState); // Log del estado actualizado
      return newState;
    }
    case 'REMOVE_ITEM': {
      console.log('Removing item with id:', action.payload.id); // Log del producto eliminado
      const newState = {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.id),
      };
      console.log('Updated state after REMOVE_ITEM:', newState); // Log del estado actualizado
      return newState;
    }
    case 'UPDATE_QUANTITY': {
      console.log('Updating quantity for item id:', action.payload.id, 'New quantity:', action.payload.quantity); // Log del cambio de cantidad
      const newState = {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
      console.log('Updated state after UPDATE_QUANTITY:', newState); // Log del estado actualizado
      return newState;
    }
    case 'RESET_CART':
      console.log('Resetting cart'); // Log del reseteo del carrito
      return { ...initialState };
    case 'UPDATE_ADDRESS':
      console.log('Updating address:', action.payload); // Log de la dirección actualizada
      return { ...state, address: action.payload || null };
    case 'UPDATE_CUSTOMER':
      console.log('Updating customer info:', action.payload); // Log de la información del cliente actualizada
      return { ...state, customer: action.payload };
    default:
      return state;
  }
}

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
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