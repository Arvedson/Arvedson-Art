"use client";
import React, { useEffect, useRef, useState } from 'react';
import { loadStripe, StripeElementsOptions, Appearance } from '@stripe/stripe-js'; // Import Appearance
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
  // Removed StripeCardElement as it was unused
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
// Make sure your Address type in types/cart.ts includes formattedAddress: string | undefined;
import { CartAction, CartItem, CustomerInfo, Address } from '../../../types/cart'; // Import types

// Load Stripe outside of the component render to avoid recreating it on every render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!, {
  betas: ['process_order_beta_3']
});

// Define props for the CheckoutForm component with specific types
interface CheckoutFormProps {
  clientSecret: string;
  total: number;
  customer: CustomerInfo | undefined; // Use imported type
  address: Address | null; // Use imported type
  dispatch: React.Dispatch<CartAction>; // Use specific dispatch type
  onClose: () => void;
  setValidationErrors: React.Dispatch<React.SetStateAction<{ address: boolean; customer: boolean; payment: boolean; emailFormat: boolean }>>; // Specific type
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
      // Stripe.js has not yet loaded.
      // Disable form submission until Stripe.js has loaded.
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
            email: customer?.email, // This is the email being sent
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
        // Modified to stringify the error object for better inspection
        console.error('Error confirming payment:', JSON.stringify(error, null, 2));
        setValidationErrors(prev => ({ ...prev, payment: true }));
      }

      if (paymentIntent?.status === 'succeeded') {
        console.log('PaymentIntent succeeded:', paymentIntent); // Log successful payment intent
        onClose();
        dispatch({ type: 'RESET_CART' });
      }
    } catch (error) {
      console.error('Error during payment process:', error); // Catch and log any other errors
      setValidationErrors(prev => ({ ...prev, payment: true }));
    } finally {
      setProcessing(false);
    }
  };

  // Options for the CardElement appearance
  const cardElementOptions: StripeElementsOptions['style'] = {
    base: {
      fontSize: '16px',
      color: 'var(--foreground)', // Use CSS variable
      '::placeholder': {
        color: 'var(--muted)', // Use CSS variable
      },
    },
    invalid: {
      color: 'var(--negative)', // Use CSS variable
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

const CarritoCompra = () => {
  const { state, dispatch } = useCart();
  const { items, address, customer } = state;
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showAddedMessage, setShowAddedMessage] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    address: false,
    customer: false,
    payment: false,
    emailFormat: false // Added state for email format validation
  });
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [missingData, setMissingData] = useState({
    address: false,
    customer: false
  });
  const [activeTab, setActiveTab] = useState<'address' | 'customer' | 'payment' | 'review'>('review');
  const [customerForm, setCustomerForm] = useState<CustomerInfo>({ // Use imported type
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || ''
  });
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const prevItemCount = useRef(items.length); // Renamed ref for clarity

  // Calculate totals before useEffect
  const totalProductos = items.reduce((acc, producto) => acc + producto.quantity, 0);
  const subtotal = items.reduce((acc, producto) => acc + producto.price * producto.quantity, 0);
  const envio = subtotal > 0 ? 50 : 0; // Example shipping cost
  const total = subtotal + envio;


  // Effect to show "Producto agregado" message
  useEffect(() => {
    if (items.length > prevItemCount.current) {
      setShowAddedMessage(true);
      const timer = setTimeout(() => {
        setShowAddedMessage(false);
      }, 2000); // Message visible for 2 seconds
      return () => clearTimeout(timer);
    }
    prevItemCount.current = items.length; // Update ref
  }, [items.length]);


  // Effect to create PaymentIntent when modal is shown and cart is not empty
  useEffect(() => {
    // Only create PaymentIntent if modal is shown, cart is not empty,
    // clientSecret is not already set, AND customer and address data are available.
    if (
        showConfirmationModal &&
        items.length > 0 &&
        !clientSecret &&
        customer?.name && // Require customer name
        (customer?.email || customer?.phone) && // Require either email or phone
        address?.formattedAddress && // Require formatted address (Ensure Address type includes formattedAddress)
        !validationErrors.emailFormat // Only create if email format is valid
    ) {
      const createPaymentIntent = async () => {
        try {
          console.log('Enviando metadata para PaymentIntent:', { // Updated log
            items: JSON.stringify(items),
            customer: JSON.stringify(customer), // This is where customer is stringified
            address: JSON.stringify(address) // This is where address is stringified
          });

          const response = await fetch('/api/payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: total, // Use calculated total
              currency: 'mxn', // Ensure currency is correct
              metadata: {
                items: JSON.stringify(items),
                customer: JSON.stringify(customer), // Sent as stringified JSON
                address: JSON.stringify(address) // Sent as stringified JSON
              }
            }),
          });

          const data = await response.json();
          if (!response.ok) {
            console.error('Error response from PaymentIntent API:', data.error); // Log API error
            throw new Error(data.error || 'Failed to create PaymentIntent');
          }

          setClientSecret(data.clientSecret);
          console.log('✅ PaymentIntent creado exitosamente');
        } catch (error) {
          console.error('❌ Error creando PaymentIntent:', error);
          // Handle error, show a message to the user
        }
      };
      createPaymentIntent();
    }
     // Reset clientSecret when modal is closed
     if (!showConfirmationModal) {
        setClientSecret(null);
     }
     // Log the dependencies to help debug why the effect might not be running
     console.log('useEffect dependencies changed:', {
         showConfirmationModal,
         itemsLength: items.length,
         clientSecretPresent: !!clientSecret,
         customerPresent: !!customer?.name && (customer?.email || customer?.phone),
         addressPresent: !!address?.formattedAddress, // Check formattedAddress
         emailFormatValid: !validationErrors.emailFormat
     });
  }, [showConfirmationModal, items, customer, address, total, clientSecret, validationErrors.emailFormat]); // Added emailFormat to dependencies


  const validateCheckout = () => {
    const missing = {
      address: !address?.formattedAddress, // Check for formattedAddress
      customer: !customer?.name || (!customer?.email && !customer?.phone) // Require name and either email or phone
    };
     // Also validate email format during checkout validation
    const emailFormatInvalid = customer?.email ? !/\S+@\S+\.\S+/.test(customer.email) : false;

    setMissingData(missing);
    setValidationErrors(prev => ({ ...prev, ...missing, emailFormat: emailFormatInvalid })); // Update all validation errors state

    return !Object.values(missing).some(Boolean) && !emailFormatInvalid; // Return true if no missing data AND email format is valid
  };

  const handleCheckoutClick = () => {
    // Always show the modal first
    setShowConfirmationModal(true);
    // Then validate and set the active tab
    if (validateCheckout()) {
      // If valid, try to go to payment, but the useEffect will handle
      // creating the PaymentIntent only when all data is ready.
      setActiveTab('payment');
    } else {
      // If not valid, go to the first tab with missing info
      if (missingData.address) setActiveTab('address');
      else if (missingData.customer) setActiveTab('customer');
      else setActiveTab('review'); // Fallback to review if something else is missing (shouldn't happen with current validation)
    }
  };

  const handleSaveCustomerInfo = () => {
    // Basic validation for customer info before saving
    const missing = {
        customer: !customerForm.name || (!customerForm.email && !customerForm.phone)
    };
     // Email format validation for the form input
    const emailFormatInvalid = customerForm.email ? !/\S+@\S+\.\S+/.test(customerForm.email) : false;


    setValidationErrors(prev => ({ ...prev, ...missing, emailFormat: emailFormatInvalid })); // Update validation errors state

    // Only save if basic customer info is present AND email format is valid (if email is provided)
    if (!missing.customer && !emailFormatInvalid) {
        dispatch({
          type: 'UPDATE_CUSTOMER',
          payload: {
            name: customerForm.name,
            email: customerForm.email,
            phone: customerForm.phone
          }
        });
        setMissingData(prev => ({ ...prev, customer: false })); // Clear missing customer data

         // After saving, check if address is also present and move to payment tab
        if (address?.formattedAddress) { // Check formattedAddress
            setActiveTab('payment');
        } else {
            setActiveTab('review'); // Otherwise go back to review or address if missing
        }
    }
  };

   // Handle input change for email to provide real-time feedback
   const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const email = e.target.value;
        setCustomerForm({ ...customerForm, email });
        // Validate email format as the user types
        if (email) {
            const emailFormatInvalid = !/\S+@\S+\.\S+/.test(email);
            setValidationErrors(prev => ({ ...prev, emailFormat: emailFormatInvalid }));
        } else {
             // Clear email format error if email field is empty
            setValidationErrors(prev => ({ ...prev, emailFormat: false }));
        }
   };


  const handleResetCart = () => {
    dispatch({ type: 'RESET_CART' });
    setShowResetConfirmation(false);
    setShowConfirmationModal(false); // Close modal if open
    setClientSecret(null); // Reset client secret
    setMissingData({ address: false, customer: false }); // Reset missing data state
    setValidationErrors({ address: false, customer: false, payment: false, emailFormat: false }); // Reset all validation errors
    setActiveTab('review'); // Reset tab to review
  };

  // Error message component
  const ErrorMessage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex items-center gap-2 text-red-500 text-sm mt-1">
      <X className="w-4 h-4" />
      {children}
    </div>
  );

  return (
    <React.Fragment>
      {/* Added message */}
      {showAddedMessage && (
        <div className="fixed top-2/5 left-1/2 z-[1001] transform -translate-x-1/2 -translate-y-1/2 bg-[var(--primary)] text-[var(--background)] px-6 py-3 rounded-xl shadow-lg animate-fadeInOut border-2 border-animation">
          Producto agregado al carrito
        </div>
      )}

      {/* Reset confirmation modal */}
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

      {/* Main Cart Display */}
      <div className="mt-12 w-full lg:w-auto xl:w-auto h-fit top-4">
        <div className={`bg-[var(--card)] rounded-xl shadow-lg p-6 space-y-6 border-2 ${
          showAddedMessage ? 'border-animation' : 'border-[var(--border)]'
        } relative transition-all duration-300`}>

          <div className="flex items-center space-x-3">
            <ShoppingCart className="w-6 h-6 text-[var(--primary)]" />
            <h2 className="text-xl font-bold text-[var(--foreground)]">Tu Carrito</h2>
          </div>

          {/* Payment and Coupon Section */}
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

          {/* Address Display/Status */}
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
                  <p className="text-xs sm:text-sm text-[var(--muted2)]">{address.formattedAddress}</p> {/* Accessing formattedAddress */}
                </div>
              </div>
            ) : (
              <div className="bg-red-50/30 p-3 rounded-md border border-red-200">
                <span className="text-sm text-[var(--negative)]">Dirección no especificada</span>
                {validationErrors.address && <ErrorMessage>Dirección requerida</ErrorMessage>}
              </div>
            )}
          </div>

          {/* Customer Info Display/Status */}
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

          {/* Cart Items List */}
          <div className="space-y-4">
            {items.length === 0 ? (
              <p className="text-[var(--muted2)] text-center py-4">Tu carrito está vacío</p>
            ) : (
              <>
                <div className="max-h-96 overflow-y-auto space-y-4 pr-2 -mr-2">
                  {items.map((producto: CartItem) => ( // Explicitly type producto
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

                {/* Order Summary */}
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

          {/* Checkout and Reset Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleCheckoutClick} // This should be defined within CarritoCompra
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
              aria-label="Reset cart"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal / Checkout Form */}
      {showConfirmationModal && ( // Modal is shown regardless of clientSecret, content depends on activeTab
        <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4">
          <div className="bg-[var(--card)] rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] flex flex-col border border-[var(--border)]">
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
              {/* Tabs for navigation within the modal */}
              <div className="flex gap-2 mt-4">
                 {/* Address Tab */}
                <button
                  onClick={() => setActiveTab('address')}
                  className={`pb-2 px-3 text-sm ${
                    activeTab === 'address'
                      ? 'border-b-2 border-[var(--primary)] text-[var(--primary)]'
                      : 'text-[var(--muted2)] hover:text-[var(--foreground)]'
                  }`}
                >
                  Dirección
                </button>
                {/* Customer Tab */}
                <button
                  onClick={() => setActiveTab('customer')}
                  className={`pb-2 px-3 text-sm ${
                    activeTab === 'customer'
                      ? 'border-b-2 border-[var(--primary)] text-[var(--primary)]'
                      : 'text-[var(--muted2)] hover:text-[var(--foreground)]'
                  }`}
                >
                  Datos Personales
                </button>
                 {/* Payment Tab - Only show if clientSecret is available */}
                <button
                  onClick={() => setActiveTab('payment')}
                   disabled={!clientSecret} // Disable if clientSecret is not ready
                  className={`pb-2 px-3 text-sm ${
                    activeTab === 'payment'
                      ? 'border-b-2 border-[var(--primary)] text-[var(--primary)]'
                      : 'text-[var(--muted2)] hover:text-[var(--foreground)]'
                  } ${!clientSecret && 'opacity-50 cursor-not-allowed'}`}
                >
                  Pago
                </button>
                 {/* Review Tab */}
                 <button
                  onClick={() => setActiveTab('review')}
                  className={`pb-2 px-3 text-sm ${
                    activeTab === 'review'
                      ? 'border-b-2 border-[var(--primary)] text-[var(--primary)]'
                      : 'text-[var(--muted2)] hover:text-[var(--foreground)]'
                  }`}
                >
                  Resumen
                </button>
              </div>
            </div>

            {/* Modal Content based on activeTab */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'address' && (
                <AddressSection
                  onAddressSelect={(address) => {
                    // When address is selected, it includes formattedAddress
                    dispatch({ type: 'UPDATE_ADDRESS', payload: address });
                    setMissingData(prev => ({ ...prev, address: false }));
                    // Move to the next step based on missing data and clientSecret
                    if (missingData.customer) {
                        setActiveTab('customer');
                    } else if (customer?.name && (customer?.email || customer?.phone)) { // Check if customer info is now available
                         setActiveTab('payment'); // Move to payment if customer is also ready
                    }
                    // If only address was missing and customer was already there, the useEffect will trigger payment intent creation
                    // If both were missing, it moves to customer tab. If only address was missing, it stays on address until selected.
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
                     {validationErrors.customer && !customerForm.name && <ErrorMessage>Nombre requerido</ErrorMessage>}
                  </div>
                  <div>
                    <label htmlFor="customerEmail" className="block text-sm text-[var(--muted2)] font-medium mb-1">Correo electrónico</label>
                    <input
                      id="customerEmail"
                      type="email"
                      value={customerForm.email}
                      onChange={handleEmailChange} // Use the new handler
                      className={`w-full px-3 py-2 border rounded-md bg-[var(--background)] text-[var(--foreground)] ${validationErrors.emailFormat ? 'border-red-500' : ''}`} // Add red border on error
                    />
                     {validationErrors.emailFormat && <ErrorMessage>Formato de correo inválido</ErrorMessage>} {/* Show email format error */}
                     {validationErrors.customer && !customerForm.email && !customerForm.phone && <ErrorMessage>Correo o teléfono requerido</ErrorMessage>}
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
                    {validationErrors.customer && !customerForm.email && !customerForm.phone && <ErrorMessage>Correo o teléfono requerido</ErrorMessage>}
                  </div>
                  <button
                    onClick={handleSaveCustomerInfo}
                    className="w-full bg-[var(--primary)] text-white py-2 rounded-md hover:bg-[var(--accent)] transition-colors"
                  >
                    Guardar Datos
                  </button>
                </div>
              )}
              {activeTab === 'payment' && clientSecret && ( // Only show payment form if clientSecret is ready
                 <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } as Appearance }}> {/* Corrected options type */}
                    <CheckoutForm
                        clientSecret={clientSecret}
                        total={total}
                        customer={customer}
                        address={address}
                        dispatch={dispatch}
                        onClose={() => setShowConfirmationModal(false)}
                        setValidationErrors={setValidationErrors}
                    />
                 </Elements>
              )}
               {activeTab === 'payment' && !clientSecret && ( // Show loading state if waiting for clientSecret
                  <div className="flex flex-col items-center justify-center py-8">
                      <RotateCw className="w-8 h-8 animate-spin text-[var(--primary)]" />
                      <p className="mt-4 text-[var(--muted2)]">Cargando opciones de pago...</p>
                  </div>
               )}
              {activeTab === 'review' && (
                <div className="pr-2">
                  {items.map((item: CartItem) => ( // Explicitly type item
                    <div key={item.id} className="flex justify-between py-3 border-b border-[var(--border)]">
                      <div>
                        <p className="font-medium text-[var(--foreground)]">{item.name}</p>
                        <p className="text-sm text-[var(--muted2)]">
                          {item.quantity} × ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-medium text-[var(--foreground)]">
                        {(item.quantity * item.price).toFixed(2)}
                      </p>
                    </div>
                  ))}
                   {/* Display Address and Customer Info in Review Tab */}
                    <div className="mt-6 space-y-4">
                        <div>
                            <h4 className="font-semibold text-[var(--foreground)]">Dirección de Envío:</h4>
                            {address?.formattedAddress ? ( // Accessing formattedAddress
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

            {/* Modal Footer with Total and Back Button */}
            {activeTab !== 'payment' && ( // Hide footer total/back button on payment tab
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

      {/* Global Styles for Animations */}
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
        /* Style for Stripe Card Element iframe */
         .StripeElement {
            display: block;
            width: 100%;
            padding: 0.75rem 1rem; /* Adjust padding as needed */
            font-size: 1rem; /* Adjust font size as needed */
            line-height: 1.5;
            color: var(--foreground); /* Match text color */
            background-color: var(--background); /* Match background color */
            background-image: none;
            background-clip: padding-box;
            border: 1px solid var(--border); /* Match border color */
            border-radius: 0.375rem; /* Match rounded corners */
            transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
         }

        .StripeElement--focus {
            border-color: var(--primary); /* Match focus ring color */
            box-shadow: 0 0 0 0.25rem rgba(var(--primary-rgb), 0.25); /* Add subtle shadow */
        }

        .StripeElement--invalid {
            border-color: var(--negative); /* Match invalid color */
        }

        .StripeElement--webkit-autofill {
            background-color: var(--background) !important; /* Prevent autofill background change */
        }
      `}</style>
    </React.Fragment>
  );
};

export default CarritoCompra;
