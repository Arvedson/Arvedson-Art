"use client";
import React, { useState, useMemo, useCallback } from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { MapPinIcon, ArrowsPointingOutIcon } from "@heroicons/react/24/outline";
import AddressInput from './AddressInput';
import useTheme from '../../hooks/useTheme';


type Address = {
  formattedAddress: string;
  location: { lat: number; lng: number };
  components: {
    streetNumber?: string;
    route?: string;
    colony?: string;
    postalCode?: string;
    city?: string;
    state?: string;
  };
};

interface AddressSectionProps {
  onAddressSelect: (address: Address) => void;
}

const libraries: ("places")[] = ['places'];

const AddressSection = ({ onAddressSelect }: AddressSectionProps) => {
  const theme = useTheme(); 
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyDj59hRpTzuj1D5k_Kf4BIW-bwidVOgDBo",
    libraries,
    region: "MX",
    language: "es"
  });

  const mapOptions = useMemo<google.maps.MapOptions>(() => ({
    disableDefaultUI: true,
    clickableIcons: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false
  }), []);

  const handleAddressSelect = useCallback((address: Address) => {
    setMapCoords(address.location);
    onAddressSelect(address);
    if (mapInstance && address.location) {
      mapInstance.panTo(address.location);
      mapInstance.setZoom(20);
    }
  }, [mapInstance, onAddressSelect]);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMapInstance(map);
    map.setZoom(20);
  }, []);

  return (
    <div className={`p-4 rounded-lg border ${
      theme === 'light' 
        ? 'border-gray-300 bg-white text-gray-800' 
        : 'border-gray-600 bg-gray-800 text-gray-200'
    }`}>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <MapPinIcon className={`w-5 h-5 ${
          theme === 'light' ? 'text-gray-700' : 'text-gray-300'
        }`} />
        <span>Dirección de Envío</span>
      </h3>
      
      <AddressInput 
        onAddressSelect={handleAddressSelect} 
        isGoogleMapsLoaded={isLoaded}
      />

      <div className="mt-4 h-[300px] rounded-lg overflow-hidden relative">
        {!isLoaded ? (
          <div className={`h-full flex items-center justify-center ${
            theme === 'light' 
              ? 'bg-gray-100 text-gray-700' 
              : 'bg-gray-700 text-gray-300'
          }`}>
            <div className="animate-pulse">Cargando mapa...</div>
          </div>
        ) : (
          mapCoords ? (
            <div className="relative h-full">
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={mapCoords}
                zoom={18}
                options={mapOptions}
                onLoad={onMapLoad}
              >
                <Marker 
                  position={mapCoords}
                  icon={{
                    url: '/map-marker.png',
                    scaledSize: new window.google.maps.Size(40, 40)
                  }}
                />
              </GoogleMap>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <MapPinIcon className="w-8 h-8 text-blue-500" />
              </div>
            </div>
          ) : (
            <div className={`h-full flex flex-col items-center justify-center ${
              theme === 'light' 
                ? 'bg-gray-50 text-gray-600' 
                : 'bg-gray-700 text-gray-300'
            }`}>
              <ArrowsPointingOutIcon className={`w-16 h-16 mb-4 ${
                theme === 'light' ? 'text-blue-500' : 'text-blue-400'
              }`} />
              <p className="text-center">
                Ingresa una dirección para ver la ubicación en el mapa
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default AddressSection;
