"use client";
import React, { useEffect } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import useTheme from '../../hooks/useTheme';

// Definición del tipo Address (podrías extraerlo a un archivo de tipos para reutilización)
interface Address {
  formattedAddress: string;
  location: {
    lat: number;
    lng: number;
  } | null;
  components: {
    streetNumber?: string;
    route?: string;
    colony?: string;
    postalCode?: string;
    city?: string;
    state?: string;
  };
}

interface CheckoutConfirmationProps {
  onClose: () => void;
  totalPrice: number;
  artworkTitle: string;
  artworkId: string;
  selectedAddress: Address | null;
  email: string;
  phone: string;
}

const CheckoutConfirmation = ({
  onClose,
  totalPrice,
  artworkTitle,
  selectedAddress,
  email,
  phone,
}: CheckoutConfirmationProps) => {
  const theme = useTheme();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 flex items-start justify-center p-4 pt-16 backdrop-blur-sm z-[1000] overflow-y-auto"
        style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className={`m-6 rounded-xl p-8 max-w-2xl w-full shadow-2xl ${
            theme === 'dark' ? 'bg-[var(--card)]' : 'bg-white'
          } border border-[var(--border)]`}
        >
          <div className="flex flex-col items-center text-center">
            <CheckCircleIcon className="w-20 h-20 text-green-500 mb-6 animate-pop-in" />
            <h2 className="text-3xl font-bold mb-2 text-[var(--foreground)]">
              ¡Pedido Confirmado!
            </h2>
            <p className="text-lg text-[var(--foreground)] mb-8">
              Tu obra de arte ha sido enviada a tu carrito
            </p>

            <div className="w-full space-y-6 text-left">
              {/* Detalles del Pedido */}
              <div className="p-6 rounded-lg bg-[var(--background)] border border-[var(--border)]">
                <h3 className="text-xl font-semibold mb-4 text-[var(--foreground)]">
                  Resumen del Pedido
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-[var(--foreground)]">Obra:</p>
                    <p className="font-medium text-[var(--foreground)]">{artworkTitle}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--foreground)]">Total:</p>
                    <p className="font-bold text-2xl text-[var(--primary)]">
                      ${totalPrice.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Detalles de Contacto */}
              <div className="p-6 rounded-lg bg-[var(--background)] border border-[var(--border)]">
                <h3 className="text-xl font-semibold mb-4 text-[var(--foreground)]">
                  Información de Contacto
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-[var(--foreground)]">Email:</p>
                    <p className="font-medium text-[var(--foreground)]">{email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--foreground)]">Teléfono:</p>
                    <p className="font-medium text-[var(--foreground)]">{phone}</p>
                  </div>
                </div>
              </div>

              {/* Dirección */}
              {selectedAddress && (
                <div className="p-6 rounded-lg bg-[var(--background)] border border-[var(--border)]">
                  <h3 className="text-xl font-semibold mb-4 text-[var(--foreground)]">
                    Dirección de Envío
                  </h3>
                  <div className="space-y-2">
                    <p className="text-[var(--foreground)]">
                      {selectedAddress.formattedAddress}
                    </p>
                    {selectedAddress.location && (
                      <p className="text-sm text-[var(--foreground)]">
                        Coordenadas: {selectedAddress.location.lat.toFixed(4)}, {selectedAddress.location.lng.toFixed(4)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Botón de Cierre */}
            <button
              onClick={onClose}
              className={`mt-8 w-full max-w-xs py-3 rounded-xl font-semibold transition-all 
                bg-[var(--primary)] hover:bg-[var(--primary-hover)] 
                text-white hover:scale-105 active:scale-95`}
            >
              Continuar Explorando
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CheckoutConfirmation;
