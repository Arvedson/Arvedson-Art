"use client";

import React, { useEffect, useRef, useState } from 'react';
import { 
  ShoppingCart, 
  ShieldCheck,   
  CreditCard, 
  Tag,            
  ChevronRight, 
  RotateCw, 
  Trash2, 
  X 
} from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import AddressSection from '../AddressSection';

const CarritoCompra = () => {
  const { state, dispatch } = useCart();
  const { items, address, customer } = state;
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  
  const [showAddedMessage, setShowAddedMessage] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    address: false,
    customer: false
  });
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [missingData, setMissingData] = useState<{
    address: boolean;
    customer: boolean;
  }>({ address: false, customer: false });
  const [activeTab, setActiveTab] = useState<'address' | 'customer' | 'review'>('review');
  const [customerForm, setCustomerForm] = useState<{ name: string; email: string; phone: string }>({
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || ''
  });

  const prevCount = useRef(items.length);

  useEffect(() => {
    if (items.length > prevCount.current) {
      setShowAddedMessage(true);
      setTimeout(() => setShowAddedMessage(false), 2000);
    }
    prevCount.current = items.length;
  }, [items.length]);

  const totalProductos = items.reduce((acc, producto) => acc + producto.quantity, 0);
  const subtotal = items.reduce((acc, producto) => acc + producto.price * producto.quantity, 0);
  const envio = subtotal > 0 ? 50 : 0;
  const total = subtotal + envio;

  const validateCheckout = () => {
    const missing = {
      address: !address?.formattedAddress,
      customer: !customer?.name || (!customer?.email && !customer?.phone)
    };
    
    setMissingData(missing);
    setValidationErrors(missing);
    return !Object.values(missing).some(Boolean);
  };

  const handleCheckoutClick = () => {
    if (validateCheckout()) {
      setShowConfirmationModal(true);
    } else {
      setShowConfirmationModal(true);
      if (missingData.address) setActiveTab('address');
      else if (missingData.customer) setActiveTab('customer');
    }
  };

  const handleSaveCustomerInfo = () => {
    dispatch({
      type: 'UPDATE_CUSTOMER',
      payload: {
        name: customerForm.name,
        email: customerForm.email,
        phone: customerForm.phone
      }
    });
    setActiveTab('review');
  };

  const handleCompleteOrder = () => {
    dispatch({ type: 'RESET_CART' });
    setShowConfirmationModal(false);
  };

  const handleResetCart = () => {
    dispatch({ type: 'RESET_CART' });
    setShowResetConfirmation(false);
  };

  const ErrorMessage = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center gap-2 text-red-500 text-sm mt-1">
      <X className="w-4 h-4" />
      {children}
    </div>
  );

  return (
    <>
      {/* Mensaje de producto agregado */}
      {showAddedMessage && (
        <div className="fixed top-2/5 left-1/2 z-[1001] transform -translate-x-1/2 -translate-y-1/2 bg-[var(--primary)] text-[var(--background)] px-6 py-3 rounded-xl shadow-lg animate-fadeInOut border-2 border-animation">
          Producto agregado al carrito
        </div>
      )}

      {/* Confirmación para vaciar carrito */}
      {showResetConfirmation && (
        <div className="fixed inset-0 bg-black/50 z-[1002] flex items-center justify-center p-4">
          <div className="bg-[var(--card)] rounded-xl p-6 max-w-md w-full border border-[var(--border)]">
            <h3 className="text-lg font-bold mb-4">¿Vaciar carrito?</h3>
            <p className="text-[var(--muted2)] mb-6">¿Estás seguro que deseas eliminar todos los productos?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowResetConfirmation(false)}
                className="px-4 py-2 text-[var(--white)] hover:bg-[var(--secondary)] rounded-md"
              >
                Cancelar
              </button>
              <button
                onClick={handleResetCart}
                className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-md"
              >
                Vaciar Carrito
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenido principal del carrito */}
      <div className="mt-12 w-full lg:w-auto xl:w-auto h-fit top-4">
        <div className={`bg-[var(--card)] rounded-xl shadow-lg p-6 space-y-6 border-2 ${
          showAddedMessage ? 'border-animation' : 'border-[var(--border)]'
        } relative transition-all duration-300`}>
          {/* Cabecera */}
          <div className="flex items-center space-x-3">
            <ShoppingCart className="w-6 h-6 text-[var(--primary)]" />
            <h2 className="text-xl font-bold text-[var(--foreground)]">Tu Carrito</h2>
          </div>
                    {/* Sección de métodos de pago y cupones  */}
                    <div className="space-y-4">
            <div className="bg-[var(--secondary)] p-4 rounded-lg space-y-2">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-[var(--foreground)]">Pago Seguro</span>
              </div>
              <div className="flex items-center space-x-2 text-[var(--muted)]">
                <CreditCard className="w-4 h-4 text-[var(--primary)]" />
                <span className="text-sm text-[var(--muted2)]">Tarjetas aceptadas: Visa, Mastercard, Amex</span>
              </div>
            </div>

            <div className="bg-[var(--secondary)] p-4 rounded-lg space-y-3">
              <div className="flex items-center space-x-2">
                <Tag className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium text-[var(--foreground)]">Cupón de descuento</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Código promocional"
                  className="flex-1 px-3 py-2 text-sm border border-[var(--border)] rounded-md focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                />
                <button className="px-3 py-2 text-sm font-medium text-white bg-[var(--primary)] rounded-md hover:bg-[var(--accent)] transition-colors">
                  Aplicar
                </button>
              </div>
            </div>
          </div>

          {/* Sección de dirección */}
          <div className="space-y-2">
            {address?.formattedAddress ? (
              <div className="bg-[var(--secondary)] p-3 rounded-md my-2 flex justify-between items-start group">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs sm:text-sm font-medium text-[var(--foreground)]">Dirección:</span>
                    <button onClick={() => dispatch({ type: 'UPDATE_ADDRESS', payload: null })}>
                      <X className="w-4 h-4 text-[var(--white)] hover:text-[var(--negative)]" />
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--muted2)]">{address.formattedAddress}</p>
                </div>
              </div>
            ) : (
              <div className="bg-red-50/30 p-3 rounded-md border border-red-200">
                <span className="text-sm text-[var(--negative)]">Dirección no especificada</span>
                {validationErrors.address && <ErrorMessage>Dirección requerida</ErrorMessage>}
              </div>
            )}
          </div>

          {/* Sección de información del cliente */}
          <div className="space-y-2">
            {(customer?.name || customer?.email || customer?.phone) ? (
              <div className="bg-[var(--secondary)] p-3 rounded-md my-2 space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs sm:text-sm font-medium text-[var(--foreground)]">Contacto:</span>
                  <button onClick={() => dispatch({ type: 'UPDATE_CUSTOMER', payload: undefined })}>
                    <X className="w-4 h-4 text-[var(--white)] hover:text-[var(--negative)]" />
                  </button>
                </div>
                {customer?.name && <p className="text-xs sm:text-sm text-[var(--muted2)]">👤 {customer.name}</p>}
                {customer?.email && <p className="text-xs sm:text-sm text-[var(--muted2)]">📧 {customer.email}</p>}
                {customer?.phone && <p className="text-xs sm:text-sm text-[var(--muted2)]">📞 {customer.phone}</p>}
              </div>
            ) : (
              <div className="bg-red-50/30 p-3 rounded-md border border-red-200">
                <span className="text-sm text-[var(--negative)]">Información de contacto faltante</span>
                {validationErrors.customer && <ErrorMessage>Información requerida</ErrorMessage>}
              </div>
            )}
          </div>

          {/* Lista de productos */}
          <div className="space-y-4">
            {items.length === 0 ? (
              <p className="text-[var(--muted2)] text-center py-4">Tu carrito está vacío</p>
            ) : (
              <>
                <div className="max-h-96 overflow-y-auto space-y-4 pr-2 -mr-2">
                  {items.map((producto) => (
                    <div key={producto.id} className="flex justify-between items-start group">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-[var(--foreground)]">{producto.name}</h3>
                        <p className="text-xs text-[var(--muted2)] mt-1">
                          {producto.quantity} × ${producto.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-sm font-medium text-[var(--foreground)]">
                          ${(producto.price * producto.quantity).toFixed(2)}
                        </span>
                        <button onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: { id: producto.id } })}>
                          <Trash2 className="w-4 h-4 text-[var(--white)] hover:text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totales */}
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

          {/* Botones de acción */}
          <div className="flex gap-2">
            <button
              onClick={handleCheckoutClick}
              disabled={items.length === 0}
              className={`w-full py-2 px-4 ${
                items.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-[var(--primary)] hover:bg-[var(--accent)]'
              } text-white rounded-md font-semibold flex items-center justify-center transition-all duration-200 shadow-sm flex-1`}
            >
              Finalizar compra
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          {/* Botón de vaciar carrito  */}
          <button
            onClick={() => setShowResetConfirmation(true)}
            className="px-3.5 py-3.5 text-[var(--white)] rounded-md font-semibold flex items-center justify-center transition-all duration-200 flex-1 border border-[var(--border)] hover:bg-[var(--secondary)]"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4">
          <div className="bg-[var(--card)] rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] flex flex-col border border-[var(--border)]">
            {/* Header */}
            <div className="p-6 border-b border-[var(--border)]">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-[var(--foreground)]">Confirmar Pedido</h3>
                <button 
                  onClick={() => setShowConfirmationModal(false)}
                  className="text-[var(--white)] hover:text-[var(--foreground)]"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Pestañas */}
              <div className="flex gap-2 mt-4">
                {missingData.address && (
                  <button
                    onClick={() => setActiveTab('address')}
                    className={`pb-2 px-3 text-[var(--white)] text-sm ${
                      activeTab === 'address' 
                        ? 'border-b-2 border-[var(--primary)] text-[var(--primary)]' 
                        : 'text-[var(--muted2)] hover:text-[var(--foreground)]'
                    }`}
                  >
                    Dirección
                  </button>
                )}
                {missingData.customer && (
                  <button
                    onClick={() => setActiveTab('customer')}
                    className={`pb-2 px-3 text-[var(--white)] text-sm ${
                      activeTab === 'customer' 
                        ? 'border-b-2 border-[var(--primary)] text-[var(--primary)]' 
                        : 'text-[var(--muted2)] hover:text-[var(--foreground)]'
                    }`}
                  >
                    Datos Personales
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('review')}
                  className={`pb-2 px-3 text-[var(--white)] text-sm ${
                    activeTab === 'review' 
                      ? 'border-b-2 border-[var(--primary)] text-[var(--primary)]' 
                      : 'text-[var(--muted2)] hover:text-[var(--foreground)]'
                  }`}
                >
                  Resumen
                </button>
              </div>
            </div>

            {/* Contenido Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'address' && (
                <AddressSection
                  onAddressSelect={(address) => {
                    dispatch({ type: 'UPDATE_ADDRESS', payload: address });
                    setMissingData(prev => ({ ...prev, address: false }));
                    setActiveTab(missingData.customer ? 'customer' : 'review');
                  }}
                />
              )}

                  <div className="space-y-4 mt-4">
                    {address && (
                      <div>
                        <p className="text-sm text-[var(--foreground)] mb-1">Enviar a:</p>
                        <p className="font-medium text-[var(--muted2)]">{address.formattedAddress}</p>
                      </div>
                    )}
                    
                    {customer && (
                      <div>
                        <p className="text-sm text-[var(--foreground)] mb-1">Contacto:</p>
                        <div className="font-medium">
                          {customer.name && <p className="text-[var(--muted2)]">👤 {customer.name}</p>}
                          {customer.email && <p className="text-[var(--muted2)]">📧 {customer.email}</p>}
                          {customer.phone && <p className="text-[var(--muted2)]">📞 {customer.phone}</p>}
                        </div>
                      </div>
                    )}
                  </div>

              {activeTab === 'customer' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-[var(--muted2)] font-medium mb-1">Nombre completo</label>
                    <input
                      type="text"
                      value={customerForm.name}
                      onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md bg-[var(--background)] text-[var(--foreground)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--muted2)] font-medium mb-1">Correo electrónico</label>
                    <input
                      type="email"
                      value={customerForm.email}
                      onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md bg-[var(--background)] text-[var(--foreground)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--muted2)] font-medium mb-1">Teléfono</label>
                    <input
                      type="tel"
                      value={customerForm.phone}
                      onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md bg-[var(--background)] text-[var(--foreground)]"
                    />
                  </div>
                  <button
                    onClick={handleSaveCustomerInfo}
                    className="w-full bg-[var(--primary)] text-white py-2 rounded-md hover:bg-[var(--accent)] transition-colors"
                  >
                    Guardar Datos
                  </button>
                </div>
              )}

              {activeTab === 'review' && (
                <>
                  <div className="pr-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between py-3 border-b border-[var(--border)]">
                        <div>
                          <p className="font-medium text-[var(--foreground)]">{item.name}</p>
                          <p className="text-sm text-[var(--muted2)]">
                            {item.quantity} × ${item.price.toFixed(2)}
                          </p>
                        </div>
                        <p className="font-medium text-[var(--foreground)]">
                          ${(item.quantity * item.price).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>


                </>
              )}
            </div>

            {/* Footer Fijo */}
            <div className="p-6 border-t border-[var(--border)] bg-[var(--card)]">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-[var(--foreground)]">Total:</span>
                <span className="text-xl font-bold text-[var(--primary)]">${total.toFixed(2)}</span>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmationModal(false)}
                  className="flex-1 py-3 px-6 border border-[var(--border)] text-[var(--white)] rounded-lg hover:bg-[var(--secondary)] transition-colors"
                >
                  Volver
                </button>
                <button
                  onClick={handleCompleteOrder}
                  className="flex-1 py-3 px-6 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--accent)] flex items-center justify-center gap-2 transition-colors"
                >
                  <CreditCard className="w-5 h-5" />
                  Confirmar Pago
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
            {/* Estilos para la animación del borde */}
            <style jsx global>{`
              @keyframes border-animation {
                0% { border-color: #ff6b6b; }
                33% { border-color: #4ecdc4; }
                66% { border-color: #45b7d1; }
                100% { border-color: #ff6b6b; }
              }
              
              .border-animation {
                animation: border-animation 1.5s ease-in-out infinite;
                border-[var(--border)]: linear-gradient(
                  45deg,
                  #ff6b6b,
                  #4ecdc4,
                  #45b7d1
                );
                border-image-slice: 1;
              }

              @keyframes gradient-border {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
              }
           `}</style>
    </>
  );
};

export default CarritoCompra;