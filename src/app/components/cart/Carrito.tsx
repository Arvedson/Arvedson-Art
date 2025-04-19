"use client";
import React, { useEffect, useRef, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js'; 
import { 
  Elements,
  CardElement,
  useStripe, 
  useElements 
} from '@stripe/react-stripe-js';



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

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!, {
  betas: ['process_order_beta_3']
});


interface Customer {
  name?: string;
  email?: string;
  phone?: string;
}

interface Address {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}



interface CheckoutFormProps {
  clientSecret: string;
  total: number;
  customer: Customer | null | undefined;
  address: Address | null | undefined;
  dispatch: any; 
  onClose: () => void;
  setValidationErrors: React.Dispatch<React.SetStateAction<any>>; 
}



const CheckoutForm: React.FC<CheckoutFormProps> = ({ 
  clientSecret,
  total,
  customer,
  address,
  dispatch,
  onClose,
  setValidationErrors 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error('Elemento de tarjeta no encontrado');
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: customer?.name,
            email: customer?.email,
            phone: customer?.phone,
            address: {
              line1: address?.street,
              city: address?.city,
              state: address?.state,
              postal_code: address?.postalCode,
              country: address?.country
            }
          }
        }
      });

      if (error) throw error;
      
      if (paymentIntent?.status === 'succeeded') {
        onClose();
        dispatch({ type: 'RESET_CART' });
      }
    } catch (error) {
      console.error('Error en el pago:', error);
      setValidationErrors(prev => ({ ...prev, payment: true }));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <CardElement 
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#323232',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
            hidePostalCode: true
          }}
          className="border rounded-md p-2 bg-[var(--background)] text-[var(--foreground)]"
        />
        <button 
          type="submit" 
          disabled={!stripe || processing}
          className={`w-full bg-[var(--primary)] text-white py-3 rounded-md hover:bg-[var(--accent)] flex items-center justify-center gap-2 ${
            (!stripe || processing) && 'opacity-50 cursor-not-allowed'
          }`}
        >
          {processing ? (
            <RotateCw className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Pagar ${total.toFixed(2)}
            </>
          )}
        </button>
      </div>
    </form>
  );
};
const CarritoCompra = () => {
  const { state, dispatch } = useCart();
  const { items, address, customer } = state;
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showAddedMessage, setShowAddedMessage] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    address: false,
    customer: false,
    payment: false
  });
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [missingData, setMissingData] = useState({
    address: false,
    customer: false
  });
  const [activeTab, setActiveTab] = useState<'address' | 'customer' | 'payment' | 'review'>('review');
  const [customerForm, setCustomerForm] = useState({
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || ''
  });
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const prevCount = useRef(items.length);

  useEffect(() => {
    if (showConfirmationModal && items.length > 0) {
      const createPaymentIntent = async () => {
        try {
          console.log('Enviando metadata:', {
            items: JSON.stringify(items),
            customer: JSON.stringify(customer),
            address: JSON.stringify(address)
          });
      
          const response = await fetch('/api/payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              amount: total,
              currency: 'mxn',
              metadata: {
                items: JSON.stringify(items),
                customer: JSON.stringify(customer),
                address: JSON.stringify(address)
              }
            }),
          });
          
          const data = await response.json();
          if (!response.ok) throw new Error(data.error);
          
          setClientSecret(data.clientSecret);
          console.log('✅ PaymentIntent creado exitosamente');
        } catch (error) {
          console.error('❌ Error creando PaymentIntent:', error);
        }
      };
      createPaymentIntent();
    }
  }, [showConfirmationModal, items, customer, address]);

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
      setActiveTab('payment');
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

  const handleResetCart = () => {
    dispatch({ type: 'RESET_CART' });
    setShowResetConfirmation(false);
  };

  const ErrorMessage = ({ children }) => (
    <div className="flex items-center gap-2 text-red-500 text-sm mt-1">
      <X className="w-4 h-4" />
      {children}
    </div>
  );

  return (
    <React.Fragment>
      {showAddedMessage && (
        <div className="fixed top-2/5 left-1/2 z-[1001] transform -translate-x-1/2 -translate-y-1/2 bg-[var(--primary)] text-[var(--background)] px-6 py-3 rounded-xl shadow-lg animate-fadeInOut border-2 border-animation">
          Producto agregado al carrito
        </div>
      )}

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

      <div className="mt-12 w-full lg:w-auto xl:w-auto h-fit top-4">
        <div className={`bg-[var(--card)] rounded-xl shadow-lg p-6 space-y-6 border-2 ${
          showAddedMessage ? 'border-animation' : 'border-[var(--border)]'
        } relative transition-all duration-300`}>
          
          <div className="flex items-center space-x-3">
            <ShoppingCart className="w-6 h-6 text-[var(--primary)]" />
            <h2 className="text-xl font-bold text-[var(--foreground)]">Tu Carrito</h2>
          </div>

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
            <button
              onClick={() => setShowResetConfirmation(true)}
              className="px-3.5 py-3.5 text-[var(--white)] rounded-md font-semibold flex items-center justify-center transition-all duration-200 flex-1 border border-[var(--border)] hover:bg-[var(--secondary)]"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {showConfirmationModal && clientSecret && (
        <Elements 
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: {
            theme: 'stripe',
            variables: {
            
            }
          }
        }}>
          <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4">
            <div className="bg-[var(--card)] rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] flex flex-col border border-[var(--border)]">
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
                    onClick={() => setActiveTab('payment')}
                    className={`pb-2 px-3 text-[var(--white)] text-sm ${
                      activeTab === 'payment' 
                        ? 'border-b-2 border-[var(--primary)] text-[var(--primary)]' 
                        : 'text-[var(--muted2)] hover:text-[var(--foreground)]'
                    }`}
                  >
                    Pago
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'address' && (
                  <AddressSection
                    onAddressSelect={(address) => {
                      dispatch({ type: 'UPDATE_ADDRESS', payload: address });
                      setMissingData(prev => ({ ...prev, address: false }));
                      setActiveTab(missingData.customer ? 'customer' : 'payment');
                    }}
                  />
                )}
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
                {activeTab === 'payment' && (
                  <CheckoutForm
                    clientSecret={clientSecret}
                    total={total}
                    customer={customer}
                    address={address}
                    dispatch={dispatch}
                    onClose={() => setShowConfirmationModal(false)}
                    setValidationErrors={setValidationErrors}
                  />
                )}
                {activeTab === 'review' && (
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
                )}
              </div>

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
                </div>
              </div>
            </div>
          </div>
        </Elements>
      )}

      <style jsx global>{`
        @keyframes border-animation {
          0% { border-color: #ff6b6b; }
          33% { border-color: #4ecdc4; }
          66% { border-color: #45b7d1; }
          100% { border-color: #ff6b6b; }
        }
        .border-animation {
          animation: border-animation 1.5s ease-in-out infinite;
          border-image: linear-gradient(
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
    </React.Fragment>
  );
};

export default CarritoCompra;