"use client";
import { useStripe } from '@stripe/react-stripe-js';
import React, { useState } from 'react';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

interface CustomerInfo {
    name: string;
    address: string;
    size: string;
}

export const StripeIconButton = ({ amount }: { amount: number }) => {
    const stripe = useStripe();
    const [isProcessing, setIsProcessing] = useState(false);
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
        name: '',
        address: '',
        size: '',
    });
    const [showInfoForm, setShowInfoForm] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, fieldName: keyof CustomerInfo) => {
        setCustomerInfo({
            ...customerInfo,
            [fieldName]: e.target.value,
        });
    };

    const handleSizeChange = (value: string) => {
        setCustomerInfo({
            ...customerInfo,
            size: value,
        });
    };

    const handlePayment = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent other click handlers.  IMPORTANT
        if (!stripe) return;
        setShowInfoForm(true);
    };

    const confirmPayment = async () => {
        setIsProcessing(true);
        try {
            if (!customerInfo.name || !customerInfo.address || !customerInfo.size) {
                alert('Por favor, completa tu nombre, dirección y selecciona el tamaño del cuadro.');
                setIsProcessing(false);
                return;
            }
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, customerInfo }),
            });

            if (!response.ok) throw new Error('Error al crear sesión de pago');

            const data = await response.json();
            const { error } = await stripe.redirectToCheckout({ sessionId: data.id });
            if (error) console.error(error);

        } catch (error) {
            console.error(error);
        } finally {
            setIsProcessing(false);
            setShowInfoForm(false);
        }
    }

    return (
        <>
            <button
                onClick={handlePayment}
                disabled={!stripe || isProcessing}
                className="p-2 rounded-full bg-[var(--primary)] hover:bg-opacity-80 transition-all duration-200 flex items-center gap-1"
            >
                <ShoppingCartIcon className="w-6 h-6 text-white" />
                <span className="text-sm text-white">
                    {isProcessing ? 'Procesando...' : 'Pagar Ahora'}
                </span>
            </button>

            {showInfoForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h2 className="text-lg font-semibold mb-4">Información del Cliente</h2>

                        <div className="mb-4">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre:</label>
                            <input
                                id="name"
                                type="text"
                                value={customerInfo.name}
                                onChange={(e) => handleInputChange(e, 'name')}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Tu nombre completo"
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Dirección:</label>
                            <input
                                id="address"
                                type="text"
                                value={customerInfo.address}
                                onChange={(e) => handleInputChange(e, 'address')}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Tu dirección"
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="size" className="block text-sm font-medium text-gray-700">Tamaño del Cuadro:</label>
                            <select
                                id="size"
                                value={customerInfo.size}
                                onChange={(e) => handleSizeChange(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                                <option value="">Selecciona el tamaño</option>
                                <option value="Pequeño">Pequeño</option>
                                <option value="Mediano">Mediano</option>
                                <option value="Grande">Grande</option>
                            </select>
                        </div>

                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => setShowInfoForm(false)}
                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={confirmPayment}
                                disabled={isProcessing}
                                className="bg-[var(--primary)] text-white px-4 py-2 rounded-md hover:bg-[var(--primary-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? 'Procesando...' : 'Confirmar y Pagar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <style jsx global>{`
              /* Estilos globales para variables de color */
              :root {
                --primary: #6366f1;
                --primary-dark: #4338ca;
              }
              .transition-colors {
                transition-property: background-color, border-color, color, fill, stroke;
                transition-duration: 150ms;
                transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
              }
            `}</style>
        </>
    );
};
