"use client";

import React from "react";
import useTheme from "@/hooks/useTheme"; // Importamos el hook personalizado

interface FadeSeparatorProps {
  flip?: boolean; // Voltear el gradiente
}

const FadeSeparator: React.FC<FadeSeparatorProps> = ({ flip = false }) => {
  const theme = useTheme(); // Usamos el hook para obtener el tema actual

  // Establecemos el color final basado en el tema
  const endColor = theme === "light" ? "#2d2d2d" : "#1a202c";

  return (
    <div
      style={{
        position: "relative",
        height: "50px",
        background: flip
          ? `linear-gradient(to bottom, ${endColor} 0%, rgba(0, 0, 0, 0) 100%)`
          : `linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, ${endColor} 100%)`,
        marginTop: flip ? "0" : "-50px",
        marginBottom: flip ? "-50px" : "0",
        zIndex: 1, // Asegura que el gradiente esté encima del fondo
      }}
    />
  );
};

export default FadeSeparator;
