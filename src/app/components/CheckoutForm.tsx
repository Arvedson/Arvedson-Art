"use client";
import React, { useState } from "react";
import useTheme from "../../hooks/useTheme";

import { 
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  PaintBrushIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import { useCart } from "../../context/CartContext";
import { Artwork, Address, OrderInfo } from "../../types/types"; // Importamos tipos compartidos

interface CheckoutFormProps {
  artwork: Artwork;
  totalPrice: number;
  address: Address | null;
  email: string;
  phone: string;
  setEmail: (value: string) => void;
  setPhone: (value: string) => void;
  onSuccess: (info: OrderInfo) => void;
}

const CheckoutForm = ({
  artwork,
  totalPrice,
  address,
  email,
  phone,
  setEmail,
  setPhone,
  onSuccess,
}: CheckoutFormProps) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const theme = useTheme();
  const { dispatch } = useCart();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    
    try {
      if (!email || !phone) {
        throw new Error('Por favor completa todos los campos requeridos');
      }
      
      dispatch({
        type: 'UPDATE_CUSTOMER',
        payload: { email, phone }
      });
      
      dispatch({
        type: 'ADD_ITEM',
        payload: {
          id: Number(artwork.id),
          name: artwork.title,
          price: totalPrice,
          quantity: 1
        }
      });
      
      if (address) {
        dispatch({ type: 'UPDATE_ADDRESS', payload: address || null });
      }
      
      onSuccess({
        artworkTitle: artwork.title,
        artworkId: artwork.id,
        totalPrice,
        email,
        phone,
        address
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg("Error al procesar el pedido");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Sección de información del cliente */}
      <div className="space-y-6">
        <div className="space-y-4">
          <label className={`flex items-center gap-2 text-sm font-medium ${
            theme === "light" ? "text-gray-700" : "text-gray-200"
          }`}>
            <EnvelopeIcon className="w-5 h-5" />
            Correo Electrónico
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            required
            className={`w-full p-3.5 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 border ${
              theme === "light" 
                ? "border-gray-300 bg-white text-gray-900" 
                : "border-gray-700 bg-gray-800 text-gray-100"
            }`}
          />
        </div>

        <div className="space-y-4">
          <label className={`flex items-center gap-2 text-sm font-medium ${
            theme === "light" ? "text-gray-700" : "text-gray-200"
          }`}>
            <PhoneIcon className="w-5 h-5" />
            Teléfono
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+52 55 1234 5678"
            required
            className={`w-full p-3.5 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 border ${
              theme === "light" 
                ? "border-gray-300 bg-white text-gray-900" 
                : "border-gray-700 bg-gray-800 text-gray-100"
            }`}
          />
        </div>
      </div>

      {/* Resumen de la compra */}
      <div className={`p-6 rounded-xl border shadow-sm ${
        theme === "light" 
          ? "border-gray-200 bg-white shadow-gray-100" 
          : "border-gray-700 bg-gray-800 shadow-gray-900"
      }`}>
        <div className="space-y-6">
          <h4 className={`flex items-center gap-2 text-xl font-bold pb-3 border-b ${
            theme === "light" 
              ? "text-gray-900 border-gray-200" 
              : "text-gray-100 border-gray-700"
          }`}>
            <ShoppingCartIcon className="w-6 h-6" />
            Resumen de tu Compra
          </h4>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="flex justify-between items-center">
              <span className={`flex items-center gap-2 font-medium ${
                theme === "light" ? "text-gray-600" : "text-gray-300"
              }`}>
                <PaintBrushIcon className="w-5 h-5" />
                Obra de Arte:
              </span>
              <span className={`font-semibold ${
                theme === "light" ? "text-gray-900" : "text-gray-100"
              }`}>
                {artwork.title}
              </span>
            </div>
            
            <div className={`flex justify-between items-center pt-4 border-t ${
              theme === "light" ? "border-gray-100" : "border-gray-700"
            }`}>
              <span className={`flex items-center gap-2 font-medium ${
                theme === "light" ? "text-gray-600" : "text-gray-300"
              }`}>
                <CurrencyDollarIcon className="w-5 h-5" />
                Total a Pagar:
              </span>
              <span className={`text-lg font-bold ${
                theme === "light" ? "text-blue-600" : "text-blue-400"
              }`}>
                ${totalPrice.toLocaleString()}
              </span>
            </div>
            
            <div className={`flex justify-between items-start pt-4 border-t ${
              theme === "light" ? "border-gray-100" : "border-gray-700"
            }`}>
              <span className={`flex items-center gap-2 font-medium ${
                theme === "light" ? "text-gray-600" : "text-gray-300"
              }`}>
                <MapPinIcon className="w-5 h-5" />
                Dirección:
              </span>
              {address ? (
                <span className={`text-right max-w-[60%] ${
                  theme === "light" ? "text-gray-800" : "text-gray-200"
                }`}>
                  {address.formattedAddress}
                </span>
              ) : (
                <span className="text-gray-500 italic">No seleccionada</span>
              )}
            </div>
            
            {email && (
              <div className={`flex justify-between items-center pt-4 border-t ${
                theme === "light" ? "border-gray-100" : "border-gray-700"
              }`}>
                <span className={`flex items-center gap-2 font-medium ${
                  theme === "light" ? "text-gray-600" : "text-gray-300"
                }`}>
                  <EnvelopeIcon className="w-5 h-5" />
                  Correo:
                </span>
                <span className={`${
                  theme === "light" ? "text-gray-800" : "text-gray-200"
                }`}>
                  {email}
                </span>
              </div>
            )}
            
            {phone && (
              <div className={`flex justify-between items-center pt-4 border-t ${
                theme === "light" ? "border-gray-100" : "border-gray-700"
              }`}>
                <span className={`flex items-center gap-2 font-medium ${
                  theme === "light" ? "text-gray-600" : "text-gray-300"
                }`}>
                  <PhoneIcon className="w-5 h-5" />
                  Teléfono:
                </span>
                <span className={`${
                  theme === "light" ? "text-gray-800" : "text-gray-200"
                }`}>
                  {phone}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className={`p-4 rounded-lg ${
          theme === "light" 
            ? "bg-red-50 text-red-700" 
            : "bg-red-900/30 text-red-300"
        }`}>
          <p className="text-sm">{errorMsg}</p>
        </div>
      )}

      {/* Botón de confirmación */}
      <button
        type="submit"
        className={`w-full py-4 px-6 rounded-xl font-semibold transition-all ${
          loading
            ? "bg-gray-400 text-white cursor-not-allowed"
            : theme === "light"
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
              : "bg-blue-500 text-white hover:bg-blue-600 shadow-md"
        }`}
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-3">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Enviando al carrito...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-3">
            <ShoppingCartIcon className="w-5 h-5" />
            Pedir Cuadro ${totalPrice.toLocaleString()}
          </span>
        )}
      </button>
    </form>
  );
};

export default CheckoutForm;
