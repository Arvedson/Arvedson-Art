
// components/cart/Carrito.tsx

"use client";
import React, { useEffect, useRef, useState } from 'react';

import { loadStripe, StripeElementsOptions, Appearance } from '@stripe/stripe-js';

import {
  Elements,
  CardElement,
  useStripe,
  useElements,
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
import { CartAction, CartItem, CustomerInfo, Address } from '../../../types/cart';

// Load Stripe outside of any component render 
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!, {
  betas: ['process_order_beta_3']
});

interface CheckoutFormProps {
  clientSecret: string;
  total: number;
  customer: CustomerInfo | undefined;
  address: Address | null;
  dispatch: React.Dispatch<CartAction>;
  onCloseCheckoutModal: () => void;
  setValidationErrors: React.Dispatch<React.SetStateAction<{ address: boolean; customer: boolean; payment: boolean; emailFormat: boolean }>>;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  clientSecret,
  total,
  customer,
  address,
  dispatch,
  onCloseCheckoutModal,
  setValidationErrors
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  // Nuevo estado para los colores que serán leídos de las variables CSS
  const [baseColor, setBaseColor] = useState('#2d2d2d'); // Valor por defecto para --foreground (claro)
  const [placeholderColor, setPlaceholderColor] = useState('#6d6d6d'); // Valor por defecto para --muted2 (claro)
  const [invalidColor, setInvalidColor] = useState('#ff6666'); // Valor por defecto para --negative (claro)

  useEffect(() => {
    // Esta función se ejecuta en el navegador para leer el valor computado de la variable CSS
    const getCssVariableValue = (variableName: string, fallback: string) => {
      if (typeof window !== 'undefined') {
        const computedStyle = getComputedStyle(document.documentElement);
        return computedStyle.getPropertyValue(variableName).trim() || fallback;
      }
      return fallback;
    };

    setBaseColor(getCssVariableValue('--foreground', '#2d2d2d'));
    setPlaceholderColor(getCssVariableValue('--muted2', '#6d6d6d')); // Usar muted2 porque es el que se usa en el input de ReplicaGrid
    setInvalidColor(getCssVariableValue('--negative', '#ff6666'));
  }, []); // Se ejecuta una sola vez al montar el componente

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
      if (error) {
        console.error('Error confirming payment:', JSON.stringify(error, null, 2));
        setValidationErrors(prev => ({ ...prev, payment: true }));
      }

      if (paymentIntent?.status === 'succeeded') {
        console.log('PaymentIntent succeeded:', paymentIntent);
        onCloseCheckoutModal(); // Llamar a la prop para cerrar el modal de checkout
        dispatch({ type: 'RESET_CART' });
      }
    } catch (error) {
      console.error('Error during payment process:', error);
      setValidationErrors(prev => ({ ...prev, payment: true }));
    } finally {
      setProcessing(false);
    }
  };

  // Usar los estados de color en cardElementOptions
  const cardElementOptions: StripeElementsOptions['style'] = {
    base: {
      fontSize: '16px',
      color: baseColor, // Usar el estado con el valor computado
      '::placeholder': {
        color: placeholderColor, // Usar el estado con el valor computado
      },
    },
    invalid: {
      color: invalidColor, // Usar el estado con el valor computado
    },
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <CardElement
          options={{
            style: cardElementOptions,
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

// --- Props for CarritoCompra itself ---
interface CarritoCompraProps {
  onCloseCartModal?: () => void;
}

const CarritoCompra: React.FC<CarritoCompraProps> = ({ onCloseCartModal }) => {
  const { state, dispatch } = useCart();
  const { items, address, customer } = state;
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showAddedMessage, setShowAddedMessage] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    address: false,
    customer: false,
    payment: false,
    emailFormat: false
  });
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [missingData, setMissingData] = useState({
    address: false,
    customer: false
  });
  const [activeTab, setActiveTab] = useState<'address' | 'customer' | 'payment' | 'review'>('review');
  const [customerForm, setCustomerForm] = useState<CustomerInfo>({
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || ''
  });
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const prevItemCount = useRef(items.length);

  // Calculate totals
  const totalProductos = items.reduce((acc, producto) => acc + producto.quantity, 0);
  const subtotal = items.reduce((acc, producto) => acc + producto.price * producto.quantity, 0);
  const envio = subtotal > 0 ? 50 : 0;
  const total = subtotal + envio; // Definido aquí para que siempre tenga el valor actual

  // Effect to show "Producto agregado" message
  useEffect(() => {
    if (items.length > prevItemCount.current) {
      setShowAddedMessage(true);
      const timer = setTimeout(() => {
        setShowAddedMessage(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
    prevItemCount.current = items.length;
  }, [items.length]);

  // Effect to create PaymentIntent
  useEffect(() => {
    if (
        showConfirmationModal &&
        items.length > 0 &&
        !clientSecret &&
        customer?.name &&
        (customer?.email || customer?.phone) &&
        address?.formattedAddress &&
        !validationErrors.emailFormat
    ) {
      const createPaymentIntent = async () => {
        try {
          console.log('Enviando metadata para PaymentIntent:', {
            items: JSON.stringify(items),
            customer: JSON.stringify(customer),
            address: JSON.stringify(address)
          });
          const response = await fetch('/api/payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: total, // Usar el total actual calculado
              currency: 'mxn',
              metadata: {
                items: JSON.stringify(items),
                customer: JSON.stringify(customer),
                address: JSON.stringify(address)
              }
            }),
          });
          const data = await response.json();
          if (!response.ok) {
            console.error('Error response from PaymentIntent API:', data.error);
            throw new Error(data.error || 'Failed to create PaymentIntent');
          }

          setClientSecret(data.clientSecret);
          console.log('✅ PaymentIntent creado exitosamente');
        } catch (error) {
          console.error('❌ Error creando PaymentIntent:', error);
        }
      };
      createPaymentIntent();
    }
     if (!showConfirmationModal) {
        setClientSecret(null);
    }
     console.log('useEffect dependencies changed:', {
         showConfirmationModal,
         itemsLength: items.length,
         clientSecretPresent: !!clientSecret,
         customerPresent: !!customer?.name && (customer?.email || customer?.phone),
         addressPresent: !!address?.formattedAddress,
         emailFormatValid: !validationErrors.emailFormat
     });
  }, [showConfirmationModal, items, customer, address, total, clientSecret, validationErrors.emailFormat]);

  const validateCheckout = () => {
    const missing = {
      address: !address?.formattedAddress,
      customer: !customer?.name || (!customer?.email && !customer?.phone)
    };
    const emailFormatInvalid = customer?.email ? !/\S+@\S+\.\S+/.test(customer.email) : false;

    setMissingData(missing);
    setValidationErrors(prev => ({ ...prev, ...missing, emailFormat: emailFormatInvalid }));

    return !Object.values(missing).some(Boolean) && !emailFormatInvalid;
  };

  const handleCheckoutClick = () => {
    setShowConfirmationModal(true);
    if (validateCheckout()) {
      setActiveTab('payment');
    } else {
      if (missingData.address) setActiveTab('address');
      else if (missingData.customer) setActiveTab('customer');
      else setActiveTab('review');
    }
  };

  const handleSaveCustomerInfo = () => {
    const missing = {
        customer: !customerForm.name || (!customerForm.email && !customerForm.phone)
    };
    const emailFormatInvalid = customerForm.email ? !/\S+@\S+\.\S+/.test(customerForm.email) : false;
    setValidationErrors(prev => ({ ...prev, ...missing, emailFormat: emailFormatInvalid }));

    if (!missing.customer && !emailFormatInvalid) {
        dispatch({
          type: 'UPDATE_CUSTOMER',
          payload: {
            name: customerForm.name,
            email: customerForm.email,
            phone: customerForm.phone
          }
        });
        setMissingData(prev => ({ ...prev, customer: false }));

        if (address?.formattedAddress) {
            setActiveTab('payment');
        } else {
            setActiveTab('review');
        }
    }
  };

   const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const email = e.target.value;
        setCustomerForm({ ...customerForm, email });
        if (email) {
            const emailFormatInvalid = !/\S+@\S+\.\S+/.test(email);
            setValidationErrors(prev => ({ ...prev, emailFormat: emailFormatInvalid }));
        } else {
            setValidationErrors(prev => ({ ...prev, emailFormat: false }));
        }
   };


  const handleResetCart = () => {
    dispatch({ type: 'RESET_CART' });
    setShowResetConfirmation(false);
    setShowConfirmationModal(false);
    setClientSecret(null);
    setMissingData({ address: false, customer: false });
    setValidationErrors({ address: false, customer: false, payment: false, emailFormat: false });
    setActiveTab('review');
    // Si se pasa un onCloseCartModal, también llamarlo
    if (onCloseCartModal) {
      onCloseCartModal();
    }
  };

  const ErrorMessage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex items-center gap-2 text-red-500 text-sm mt-1">
      <X className="w-4 h-4" />
      {children}
    </div>
  );
  return (
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
              className="flex-1 px-3 py-2 text-sm border border-[var(--border)] rounded-md focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-[var(--background)] text-[var(--foreground)]"
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
                <button onClick={() => dispatch({ type: 'UPDATE_ADDRESS', payload: null })} aria-label="Remove address">
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
              <button onClick={() => dispatch({ type: 'UPDATE_CUSTOMER', payload: undefined })} aria-label="Remove customer info">
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
              {items.map((producto: CartItem) => (
                <div key={producto.id} className="flex justify-between items-start group">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-[var(--foreground)]">{producto.name}</h3>
                    <p className="text-xs text-[var(--muted2)] mt-1">
                      {producto.quantity} × ${producto.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-medium text-[var(--foreground)]">
                      {(producto.price * producto.quantity).toFixed(2)}
                    </span>
                    <button onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: { id: producto.id } })} aria-label={`Remove ${producto.name}`}>
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
          className={`w-full h-full py-2 px-4 ${
            items.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-[var(--primary)] hover:bg-[var(--accent)]'
          } text-white rounded-md font-semibold flex items-center justify-center transition-all duration-200 shadow-sm flex-1`}
        >
          Finalizar compra
          <ChevronRight className="w-4 h-4 ml-2" />
        </button>
        <button
          onClick={() => setShowResetConfirmation(true)}
          className="px-3.5 py-3.5 text-[var(--white)] rounded-md font-semibold flex items-center justify-center transition-all duration-200 flex-1 border border-[var(--border)] hover:bg-[var(--secondary)]"
          aria-label="Reset cart"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

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

{showConfirmationModal && (
  <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-0 sm:p-4">
    <div className="bg-[var(--card)] rounded-none sm:rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] flex flex-col border border-[var(--border)] overflow-hidden">
      
      {/* Header */}
      <div className="p-6 border-b border-[var(--border)]">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-[var(--foreground)]">Confirmar Pedido</h3>
          <button
            onClick={() => setShowConfirmationModal(false)}
            className="text-[var(--white)] hover:text-[var(--foreground)]"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs - Responsive Grid on Mobile, Flex with Scroll on Desktop */}
        <div className="grid grid-cols-2 gap-2 mt-4 sm:flex sm:flex-wrap sm:gap-2 sm:overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveTab('address')}
            className={`pb-2 px-3 text-sm whitespace-nowrap ${
              activeTab === 'address'
                ? 'border-b-2 border-[var(--primary)] text-[var(--primary-bg)]'
                : 'text-[var(--foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            Dirección
          </button>
          <button
            onClick={() => setActiveTab('customer')}
            className={`pb-2 px-3 text-sm whitespace-nowrap ${
              activeTab === 'customer'
                ? 'border-b-2 border-[var(--primary)] text-[var(--primary-bg)]'
                : 'text-[var(--foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            Datos Personales
          </button>
          <button
            onClick={() => setActiveTab('payment')}
            disabled={!clientSecret}
            className={`pb-2 px-3 text-sm whitespace-nowrap ${
              activeTab === 'payment'
                ? 'border-b-2 border-[var(--primary)] text-[var(--primary-bg)]'
                : 'text-[var(--foreground)] hover:text-[var(--foreground)]'
            } ${!clientSecret && 'opacity-50 cursor-not-allowed'}`}
          >
            Pago
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={`pb-2 px-3 text-sm whitespace-nowrap ${
              activeTab === 'review'
                ? 'border-b-2 border-[var(--primary)] text-[var(--primary-bg)]'
                : 'text-[var(--foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            Resumen
          </button>
        </div>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'address' && (
          <AddressSection
            onAddressSelect={(address) => {
              dispatch({ type: 'UPDATE_ADDRESS', payload: address });
              setMissingData(prev => ({ ...prev, address: false }));
              if (missingData.customer) {
                setActiveTab('customer');
              } else if (customer?.name && (customer?.email || customer?.phone)) {
                setActiveTab('payment');
              }
            }}
          />
        )}

        {activeTab === 'customer' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="customerName" className="block text-sm text-[var(--muted2)] font-medium mb-1">Nombre completo</label>
              <input
                id="customerName"
                type="text"
                value={customerForm.name}
                onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-[var(--background)] text-[var(--foreground)]"
              />
              {validationErrors.customer && !customerForm.name && (
                <ErrorMessage>Nombre requerido</ErrorMessage>
              )}
            </div>

            <div>
              <label htmlFor="customerEmail" className="block text-sm text-[var(--muted2)] font-medium mb-1">Correo electrónico</label>
              <input
                id="customerEmail"
                type="email"
                value={customerForm.email}
                onChange={handleEmailChange}
                className={`w-full px-3 py-2 border rounded-md bg-[var(--background)] text-[var(--foreground)] ${
                  validationErrors.emailFormat ? 'border-red-500' : ''
                }`}
              />
              {validationErrors.emailFormat && (
                <ErrorMessage>Formato de correo inválido</ErrorMessage>
              )}
              {validationErrors.customer && !customerForm.email && !customerForm.phone && (
                <ErrorMessage>Correo o teléfono requerido</ErrorMessage>
              )}
            </div>

            <div>
              <label htmlFor="customerPhone" className="block text-sm text-[var(--muted2)] font-medium mb-1">Teléfono</label>
              <input
                id="customerPhone"
                type="tel"
                value={customerForm.phone}
                onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-[var(--background)] text-[var(--foreground)]"
              />
              {validationErrors.customer && !customerForm.email && !customerForm.phone && (
                <ErrorMessage>Correo o teléfono requerido</ErrorMessage>
              )}
            </div>

            <button
              onClick={handleSaveCustomerInfo}
              className="w-full bg-[var(--primary)] text-white py-2 rounded-md hover:bg-[var(--accent)] transition-colors"
            >
              Guardar Datos
            </button>
          </div>
        )}

        {activeTab === 'payment' && clientSecret && (
          <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
            <CheckoutForm
              clientSecret={clientSecret}
              total={total}
              customer={customer}
              address={address}
              dispatch={dispatch}
              onCloseCheckoutModal={() => setShowConfirmationModal(false)}
              setValidationErrors={setValidationErrors}
            />
          </Elements>
        )}

        {activeTab === 'payment' && !clientSecret && (
          <div className="flex flex-col items-center justify-center py-8">
            <RotateCw className="w-8 h-8 animate-spin text-[var(--primary)]" />
            <p className="mt-4 text-[var(--muted2)]">Cargando opciones de pago...</p>
          </div>
        )}

        {activeTab === 'review' && (
          <div className="pr-2">
            {items.map((item: CartItem) => (
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

            <div className="mt-6 space-y-4">
              <div>
                <h4 className="font-semibold text-[var(--foreground)]">Dirección de Envío:</h4>
                {address?.formattedAddress ? (
                  <p className="text-sm text-[var(--muted2)]">{address.formattedAddress}</p>
                ) : (
                  <p className="text-sm text-[var(--negative)]">Dirección no especificada</p>
                )}
              </div>

              <div>
                <h4 className="font-semibold text-[var(--foreground)]">Datos de Contacto:</h4>
                {(customer?.name || customer?.email || customer?.phone) ? (
                  <div className="text-sm text-[var(--muted2)]">
                    {customer?.name && <p>👤 {customer.name}</p>}
                    {customer?.email && <p>📧 {customer.email}</p>}
                    {customer?.phone && <p className="text-xs sm:text-sm text-[var(--muted2)]">📞 {customer.phone}</p>}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--negative)]">Información de contacto faltante</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {activeTab !== 'payment' && (
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
      )}
    </div>
  </div>
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
         .StripeElement {
            display: block;
            width: 100%;
            padding: 0.75rem 1rem;
            font-size: 1rem;
            line-height: 1.5;
            /* La propiedad 'color' aquí NO afectará el texto dentro del iframe de Stripe.
               Se controla mediante las 'options.style.base.color' en el componente CardElement. */
            background-color: var(--background);
            background-image: none;
            background-clip: padding-box;
            border: 1px solid var(--border);
            border-radius: 0.375rem;
            transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }

        .StripeElement--focus {
            border-color: var(--primary);
            box-shadow: 0 0 0 0.25rem rgba(var(--primary-rgb), 0.25);
        }

        .StripeElement--invalid {
            border-color: var(--negative);
        }

        .StripeElement--webkit-autofill {
            background-color: var(--background) !important;
        }
      `}</style>
    </div>
  );
};

export default CarritoCompra;