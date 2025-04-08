"use client";
import React, { useState } from "react";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import CuadroPersonalizado from "./CuadroPersonalizado";
import CheckoutForm from "./CheckoutForm";
import AddressSection from "./AddressSection";
import CheckoutConfirmation from "./CheckoutConfirmation";

// Interfaces unificadas y compatibles con todos los componentes
interface Artwork {
  id: string;
  title: string;
  mainImageUrl: string;
}

interface Address {
  formattedAddress: string;
  location: { lat: number; lng: number } | null;
  components: {
    streetNumber?: string;
    route?: string;
    colony?: string;
    postalCode?: string;
    city?: string;
    state?: string;
  };
}

interface OrderInfo {
  artworkTitle: string;
  artworkId: string;
  totalPrice: number;
  email: string;
  phone: string;
  address: Address | null;
}

interface PrepagoProps {
  artwork: Artwork ;
  onClose: () => void;
}

const Prepago: React.FC<PrepagoProps> = ({ artwork, onClose }) => {
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [cuadroPrice, setCuadroPrice] = useState(5000);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<OrderInfo | null>(null);
  const [paymentEmail, setPaymentEmail] = useState("");
  const [paymentPhone, setPaymentPhone] = useState("");

  const handlePrecioChange = (precio: number) => {
    setCuadroPrice(precio);
  };

  const handlePaymentSuccess = (info: OrderInfo) => {
    setPaymentInfo(info);
    setPaymentSuccess(true);
  };

  const handleCloseConfirmation = () => {
    onClose();
  };

  if (paymentSuccess && paymentInfo) {
    return (
      <div className="p-6 h-full bg-[var(--background)]">
        <CheckoutConfirmation
          email={paymentInfo.email}
          phone={paymentInfo.phone}
          totalPrice={paymentInfo.totalPrice}
          artworkTitle={paymentInfo.artworkTitle}
          artworkId={paymentInfo.artworkId}
          selectedAddress={paymentInfo.address}
          onClose={handleCloseConfirmation}
        />
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-y-auto bg-[var(--background)]">
      <h2 className={`text-2xl font-bold mb-6 flex items-center gap-2 text-[var(--foreground)]`}>
        <ShoppingCartIcon className="w-6 h-6" />
        Finalizar Compra
      </h2>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className={`p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]`}>
            <h3 className={`text-lg font-semibold mb-4 text-[var(--foreground)]`}>
              Pide una replica, el tamaño que quieras.
            </h3>
            <div className="flex flex-col gap-4">
              <img
                src={artwork.mainImageUrl}
                alt={artwork.title}
                className="w-full md:w-auto md:max-w-md object-cover rounded-lg"
              />
              <div className="flex-1">
                <h4 className={`text-lg font-medium text-[var(--foreground)]`}>
                  {artwork.title}
                </h4>
                <div className="mt-4">
                  <label className={`block text-sm font-medium mb-2 text-[var(--foreground)]`}>
                    Tamaño del cuadro
                  </label>
                  <CuadroPersonalizado onChangePrecio={handlePrecioChange} />
                </div>
                <div className="mt-4">
                  <p className={`text-lg font-bold text-[var(--foreground)]`}>
                    Total: <span className="text-[var(--primary)]">${cuadroPrice.toLocaleString()}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <AddressSection
            onAddressSelect={(address: Address) => setSelectedAddress({
              ...address,
              location: address.location || null,
              components: address.components || {
                streetNumber: '',
                route: '',
                colony: '',
                postalCode: '',
                city: '',
                state: ''
              }
            })}
          />
        </div>

        <div className={`p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]`}>
          <h3 className={`text-lg font-semibold mb-6 text-[var(--foreground)]`}>
            Tu pedido
          </h3>
          <CheckoutForm
            artwork={artwork}
            totalPrice={cuadroPrice}
            address={selectedAddress ? {
              ...selectedAddress,
              location: selectedAddress.location || null
            } : null}
            email={paymentEmail}
            phone={paymentPhone}
            setEmail={setPaymentEmail}
            setPhone={setPaymentPhone}
            onSuccess={handlePaymentSuccess as (info: OrderInfo) => void}
          />
        </div>
      </div>
    </div>
  );
};

export default Prepago;