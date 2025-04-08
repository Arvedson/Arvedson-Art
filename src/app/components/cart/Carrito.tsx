"use client";

import React, { useEffect, useRef, useState } from 'react';
import { ShoppingCart, CheckCircle, CreditCard, Gift, ChevronRight, RotateCw, Trash2, X } from 'lucide-react';
import { useCart } from '../../../context/CartContext';


const CarritoCompra = () => {
  const { state, dispatch } = useCart();
  const { items, address, customer } = state;
  

  // Estado para mostrar mensaje de agregado
  const [showAddedMessage, setShowAddedMessage] = useState(false);
  const prevCount = useRef(items.length);

  useEffect(() => {
    if (items.length > prevCount.current) {
      setShowAddedMessage(true);
      setTimeout(() => setShowAddedMessage(false), 2000);
    }
    prevCount.current = items.length;
  }, [items.length]);

  // Calcular totales
  const totalProductos = items.reduce((acc, producto) => acc + producto.quantity, 0);
  const subtotal = items.reduce((acc, producto) => acc + producto.price * producto.quantity, 0);
  const envio = subtotal > 0 ? 50 : 0;
  const total = subtotal + envio;

  const handleResetCart = () => {
    dispatch({ type: 'RESET_CART' });
  };
  
  const handleRemoveItem = (id: number) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  };
  
  const handleRemoveAddress = () => {
    dispatch({ type: 'UPDATE_ADDRESS', payload: null }); 
  };
  
  const handleRemoveCustomer = () => {
    dispatch({ type: 'UPDATE_CUSTOMER', payload: undefined });
  };

  return (
    <>
      {showAddedMessage && (
        <div className="fixed top-2/5 left-1/2 z-[1001] transform -translate-x-1/2 -translate-y-1/2 bg-[var(--primary)] text-[var(--background)] px-6 py-3 rounded-xl shadow-lg animate-fadeInOut">
          Producto agregado al carrito
        </div>
      )}

      <div className="mt-12 w-full lg:w-auto xl:w-auto h-fit top-4">
        <div className={`bg-[var(--card)] rounded-xl shadow-lg p-6 space-y-6 border border-[var(--border)] relative`}>
          <div className="flex items-center space-x-3">
            <ShoppingCart className="w-6 h-6 text-[var(--primary)]" />
            <h2 className="text-xl font-bold text-[var(--foreground)]">Tu Carrito</h2>
          </div>

          {address?.formattedAddress && (
            <div className="bg-[var(--secondary)] p-3 rounded-md my-2 flex justify-between items-start group">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs sm:text-sm font-medium text-[var(--muted2)]">Dirección:</span>
                  <button
                    onClick={handleRemoveAddress}
                    className="text-[var(--muted)] hover:text-red-500 transition-colors p-1 -mt-1 -mr-1 bg-red-100/50 rounded-full"
                    title="Eliminar dirección"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-[var(--foreground)] line-clamp-2 break-words">
                  {address.formattedAddress}
                </p>
              </div>
            </div>
          )}

          {(customer?.email || customer?.phone) && (
            <div className="bg-[var(--secondary)] p-3 rounded-md my-2 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs sm:text-sm font-medium text-[var(--muted2)]">Información de contacto:</span>
                <button
                  onClick={handleRemoveCustomer}
                  className="text-[var(--muted)] hover:text-red-500 transition-colors p-1 -mt-1 -mr-1 bg-red-100/50 rounded-full"
                  title="Eliminar información de contacto"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {customer?.email && (
                <p className="text-xs sm:text-sm text-[var(--foreground)]">
                  ✉️ {customer.email}
                </p>
              )}
              {customer?.phone && (
                <p className="text-xs sm:text-sm text-[var(--foreground)]">
                  📞 {customer.phone}
                </p>
              )}
            </div>
          )}

          <div className="space-y-4">
            {items.length === 0 ? (
              <p className="text-[var(--muted2)] text-center py-4">Tu carrito está vacío</p>
            ) : (
              <>
                <div className="max-h-96 overflow-y-auto space-y-4 pr-2 -mr-2">
                  {items.map((producto) => (
                    <div key={producto.id} className="flex justify-between items-start group">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-[var(--foreground)] line-clamp-1">
                          {producto.name}
                        </h3>
                        <p className="text-xs text-[var(--muted2)] mt-1">
                          {producto.quantity} × ${producto.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-sm font-medium text-[var(--foreground)]">
                          ${(producto.price * producto.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleRemoveItem(producto.id)}
                          className="text-[var(--muted)] hover:text-red-500 transition-colors"
                          title="Eliminar producto"
                        >
                          <Trash2 className="text-[var(--white)]  w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-4 border-t border-[var(--border)]">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--muted2)]">Subtotal ({totalProductos}):</span>
                    <span className="font-medium text-[var(--muted2)]">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--muted2)]">Envío:</span>
                    <span className="font-medium text-[var(--muted2)]">${envio.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold pt-2">
                    <span className="text-[var(--foreground)]">Total:</span>
                    <span className="text-[var(--primary)]">${total.toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-[var(--secondary)] p-4 rounded-lg space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-[var(--foreground)]">Método de pago</span>
              </div>
              <div className="flex items-center space-x-2 text-[var(--muted)]">
                <CreditCard className="w-4 h-4 text-[var(--primary)]" />
                <span className="text-sm text-[var(--muted2)]">Tarjeta de crédito/débito</span>
              </div>
            </div>

            <div className="bg-[var(--secondary)] p-4 rounded-lg space-y-3">
              <div className="flex items-center space-x-2">
                <Gift className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium text-[var(--foreground)]">Cupón de descuento</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Código de cupón"
                  className="flex-1 px-3 py-2 text-sm border border-[var(--border)] rounded-md focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                />
                <button className="px-3 py-2 text-sm font-medium text-white bg-[var(--primary)] rounded-md hover:bg-[var(--accent)] transition-colors">
                  Aplicar
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              className="w-full py-2 px-4 bg-[var(--primary)] hover:bg-[var(--accent)] text-[var(--white)] rounded-md font-semibold flex items-center justify-center transition-all duration-200 shadow-sm flex-1"
              disabled={items.length === 0}
            >
              Finalizar compra
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
            <button
              onClick={handleResetCart}
              className="px-3.5 py-3.5 text-[var(--white)] rounded-md font-semibold flex items-center justify-center transition-all duration-200 flex-1 border border-[var(--border)] hover:bg-[var(--secondary)]"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CarritoCompra;