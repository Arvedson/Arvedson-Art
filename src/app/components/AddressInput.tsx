"use client";
import React, { useState, useCallback, useRef, useEffect } from 'react';
import Select, { SingleValue } from 'react-select';

type AutocompletePrediction = google.maps.places.AutocompletePrediction;


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

interface AddressInputProps {
  theme?: 'light' | 'dark';
  onAddressSelect: (address: Address) => void;
  isGoogleMapsLoaded: boolean;
}

const AddressInput = ({ theme = 'light', onAddressSelect, isGoogleMapsLoaded }: AddressInputProps) => {
  const [options, setOptions] = useState<Array<{ value: string; label: string; data?: AutocompletePrediction }>>([]);
  const [inputValue, setInputValue] = useState('');
  const [googlePlacesService, setGooglePlacesService] = useState<google.maps.places.PlacesService | null>(null);
  const [isAPILoaded, setIsAPILoaded] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState<(query: string) => void>(() => () => {});
  const isMounted = useRef(true);
  const [autocompleteService, setAutocompleteService] = useState<google.maps.places.AutocompleteService | null>(null);

  useEffect(() => {
    if (isGoogleMapsLoaded && typeof google !== 'undefined') {
      const mapElement = document.createElement('div');
      const placesService = new google.maps.places.PlacesService(mapElement);
      setGooglePlacesService(placesService);
      setAutocompleteService(new google.maps.places.AutocompleteService());
      setIsAPILoaded(true);
      isMounted.current = true;
    }

    return () => {
      setIsAPILoaded(false);
      setGooglePlacesService(null);
      setAutocompleteService(null);
      isMounted.current = false;
    };
  }, [isGoogleMapsLoaded]);

  const searchAddresses = useCallback((query: string) => {
    if (!autocompleteService || !isAPILoaded || !isMounted.current || query.trim() === '') {
      setOptions([]);
      return;
    }

    const MEXICO_BOUNDS = new google.maps.LatLngBounds(
      new google.maps.LatLng(14.5383, -118.5999),
      new google.maps.LatLng(32.7186, -86.4932)
    );

    const request: google.maps.places.AutocompletionRequest = {
      input: query,
      types: ['address'],
      componentRestrictions: { country: 'mx' },
      language: 'es',
      bounds: MEXICO_BOUNDS,
    };

    autocompleteService.getPlacePredictions(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        const suggestions = results.map(result => ({
          value: result.place_id,
          label: result.description,
          data: result,
        }));
        setOptions(suggestions);
      } else {
        setOptions([]);
      }
    });
  }, [autocompleteService, isAPILoaded]);

  const handleInputChange = useCallback((newValue: string) => {
    setInputValue(newValue);
    debouncedSearch(newValue);
  }, [debouncedSearch]);

  const debounce = useCallback((func: (query: string) => void, delay: number) => {
    let timer: NodeJS.Timeout;
    return (query: string) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(query), delay);
    };
  }, []);

  useEffect(() => {
    if (isAPILoaded) {
      setDebouncedSearch(() => debounce(searchAddresses, 300));
    }
  }, [searchAddresses, debounce, isAPILoaded]);

  const handleSelect = useCallback(async (selectedOption: SingleValue<{ value: string; label: string; data?: AutocompletePrediction }>) => {
    if (selectedOption && googlePlacesService) {
      const detailsRequest: google.maps.places.PlaceDetailsRequest = {
        placeId: selectedOption.value,
        fields: ['address_components', 'formatted_address', 'geometry'],
        sessionToken: new google.maps.places.AutocompleteSessionToken(),
      };

      googlePlacesService.getDetails(detailsRequest, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          const addressComponents = place.address_components?.reduce((acc, component) => ({
            ...acc,
            [component.types[0]]: component.long_name,
          }), {} as Record<string, string>);

          const address: Address = {
            formattedAddress: place.formatted_address || '',
            location: place.geometry?.location?.toJSON() || { lat: 0, lng: 0 },
            components: {
              streetNumber: addressComponents?.street_number,
              route: addressComponents?.route,
              colony: addressComponents?.sublocality_level_1,
              postalCode: addressComponents?.postal_code,
              city: addressComponents?.locality,
              state: addressComponents?.administrative_area_level_1,
            },
          };
          onAddressSelect(address);
          setInputValue(place.formatted_address || '');
        }
      });
    }
  }, [googlePlacesService, onAddressSelect]);

  return (
    <div className="w-full max-w-md space-y-2">
      <label className="block text-sm font-medium mb-1">Dirección de Envío</label>
      <Select
        options={options}
        onInputChange={handleInputChange}
        onChange={handleSelect}
        inputValue={inputValue}
        placeholder="Escribe tu dirección..."
        noOptionsMessage={() => "Escribe para buscar direcciones"}
        isSearchable
        className="text-black"
        isLoading={!isAPILoaded}
        loadingMessage={() => "Buscando direcciones..."}
        components={{ DropdownIndicator: () => null }}
        filterOption={null}
        menuShouldScrollIntoView={false}
        classNamePrefix={`react-select ${theme}`}
        styles={{
          control: (provided) => ({
            ...provided,
            width: '100%',
            minWidth: '0px',
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }),
          singleValue: (provided) => ({
            ...provided,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: 'calc(100% - 2rem)',
          }),
          input: (provided) => ({
            ...provided,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }),
          placeholder: (provided) => ({
            ...provided,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }),
          dropdownIndicator: (provided) => ({
            ...provided,
            padding: '0',
          }),
          menu: (provided) => ({
            ...provided,
            maxHeight: '200px',
            overflowY: 'auto',
          }),
          option: (provided) => ({
            ...provided,
            maxWidth: '100%',
            whiteSpace: 'normal',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }),
        }}
      />
    </div>
  );
};

export default AddressInput;
