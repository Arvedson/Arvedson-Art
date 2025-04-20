// Contexto del Carrito actualizado
"use client";

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { CartState, CartAction } from '../types/cart'; // Import CartState and CartAction types

// Define the initial state for the cart
const initialState: CartState = {
  items: [], // Initially, the cart is empty
  address: null, // No address selected initially
  customer: undefined, // No customer info initially
};

// The reducer function that handles state transitions based on actions
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      console.log('Adding item:', action.payload); // Log the item being added
      // Check if the item already exists in the cart
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        // If item exists, update its quantity
        const newState = {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 } // Increment quantity
              : item
          ),
        };
        console.log('Updated state after ADD_ITEM:', newState); // Log the updated state
        return newState;
      }
      // If item does not exist, add it with quantity 1
      const newState = {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }],
      };
      console.log('Updated state after ADD_ITEM:', newState); // Log the updated state
      return newState;
    }
    case 'REMOVE_ITEM': {
      console.log('Removing item with id:', action.payload.id); // Log the item ID being removed
      // Filter out the item with the specified ID
      const newState = {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.id),
      };
      console.log('Updated state after REMOVE_ITEM:', newState); // Log the updated state
      return newState;
    }
    // Corrected action type to match types/cart.ts
    case 'UPDATE_ITEM_QUANTITY': {
      console.log('Updating quantity for item id:', action.payload.id, 'New quantity:', action.payload.quantity); // Log the quantity change
      // Update the quantity of the item with the specified ID
      const newState = {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity } // Set new quantity
            : item
        ),
      };
      console.log('Updated state after UPDATE_ITEM_QUANTITY:', newState); // Log the updated state
      return newState;
    }
    case 'RESET_CART':
      console.log('Resetting cart'); // Log cart reset
      // Reset the state to the initial state
      return { ...initialState };
    case 'UPDATE_ADDRESS':
      console.log('Updating address:', action.payload); // Log address update
      // Update the address in the state
      return { ...state, address: action.payload || null };
    case 'UPDATE_CUSTOMER':
      console.log('Updating customer info:', action.payload); // Log customer info update
      // Update the customer information in the state
      return { ...state, customer: action.payload };
    default:
      // Return current state for any unhandled actions
      return state;
  }
}

// Create the context
const CartContext = createContext<{
  state: CartState; // The current state of the cart
  dispatch: React.Dispatch<CartAction>; // The dispatch function to send actions
}>({
  state: initialState, // Provide initial state
  dispatch: () => null, // Provide a dummy dispatch function initially
});

// Create the CartProvider component
export function CartProvider({ children }: { children: ReactNode }) {
  // Use the useReducer hook to manage state with the cartReducer
  const [state, dispatch] = useReducer(cartReducer, initialState);
  return (
    // Provide the state and dispatch function to the context consumers
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

// Custom hook to easily access the cart state and dispatch function
export function useCart() {
  return useContext(CartContext);
}
