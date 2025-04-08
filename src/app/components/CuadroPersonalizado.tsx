"use client";
import React, { useState, useEffect } from "react";
import useTheme from "../../hooks/useTheme";
import { calculateFramePrice } from "@/utils/pricer";

interface CuadroPersonalizadoProps {
  moneda?: string;
  onChangePrecio?: (precio: number) => void;
}

const CuadroPersonalizado: React.FC<CuadroPersonalizadoProps> = ({
  moneda = "$",
  onChangePrecio,
}) => {
  const [anchoCm, setAnchoCm] = useState<string>("");
  const [altoCm, setAltoCm] = useState<string>("");
  const [precio, setPrecio] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (!anchoCm || !altoCm) {
        setPrecio(null);
        if (onChangePrecio) onChangePrecio(0);
        return;
      }

      const ancho = parseInt(anchoCm);
      const alto = parseInt(altoCm);

      if (isNaN(ancho)) {
        setError("Ancho inválido");
        return;
      }

      if (isNaN(alto)) {
        setError("Alto inválido");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const precioCalculado = await calculateFramePrice(ancho, alto);
        setPrecio(precioCalculado);
        if (onChangePrecio) onChangePrecio(precioCalculado);
      } catch (_err) {
        setError("Error al calcular el precio. Intente nuevamente.");
        setPrecio(null);
        if (onChangePrecio) onChangePrecio(0);
      } finally {
        setLoading(false);
      }
    }, 500); // Debounce de 500ms

    return () => clearTimeout(handler);
  }, [anchoCm, altoCm, onChangePrecio]);

  const handleChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    setter(numericValue);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <label
          htmlFor="ancho"
          className={`block text-sm font-medium ${
            theme === "light" ? "text-gray-700" : "text-gray-200"
          }`}
        >
          Ancho (cm)
        </label>
        <input
          id="ancho"
          type="number"
          value={anchoCm}
          onChange={(e) => handleChange(setAnchoCm, e.target.value)}
          className={`w-full p-3 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 border ${
            theme === "light"
              ? "border-gray-300 bg-white text-gray-900"
              : "border-gray-700 bg-gray-800 text-gray-100"
          }`}
          min="1"
          placeholder="Ej: 120"
        />
      </div>

      <div className="space-y-4">
        <label
          htmlFor="alto"
          className={`block text-sm font-medium ${
            theme === "light" ? "text-gray-700" : "text-gray-200"
          }`}
        >
          Alto (cm)
        </label>
        <input
          id="alto"
          type="number"
          value={altoCm}
          onChange={(e) => handleChange(setAltoCm, e.target.value)}
          className={`w-full p-3 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 border ${
            theme === "light"
              ? "border-gray-300 bg-white text-gray-900"
              : "border-gray-700 bg-gray-800 text-gray-100"
          }`}
          min="1"
          placeholder="Ej: 80"
        />
      </div>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      <div className="mt-6">
        {loading ? (
          <div className="flex items-center gap-2 text-[var(--foreground)]">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            Calculando precio...
          </div>
        ) : precio ? (
          <>
            <p className={`text-sm ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
              Precio para tu cuadro de {anchoCm}cm x {altoCm}cm
            </p>
            <p className="text-lg font-semibold mt-2 text-[var(--foreground)]">
              {moneda}{precio.toLocaleString("es-MX", { maximumFractionDigits: 0 })}
            </p>
          </>
        ) : (
          <p className={`text-sm ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
            Ingrese las dimensiones para calcular el precio
          </p>
        )}
      </div>
    </div>
  );
};

export default CuadroPersonalizado;
