"use client";

import React from "react";
import useTheme from "@/hooks/useTheme";

interface FadeSeparatorProps {
  flip?: boolean;
  topColor?: string | { light: string; dark: string };
  bottomColor?: string | { light: string; dark: string };
  height?: number;
  fadeToTransparent?: "top" | "bottom" | "both";
}

const FadeSeparator: React.FC<FadeSeparatorProps> = ({
  flip = false,
  topColor,
  bottomColor,
  height = 50,
  fadeToTransparent
}) => {
  const theme = useTheme();

  // Defaults usando variables CSS
  const themeDefaults = {
    light: {
      top: "var(--primary-bg)",
      bottom: "var(--foreground)"
    },
    dark: {
      top: "var(--background)",
      bottom: "var(--secondary)"
    }
  };

  // Resuelve colores con soporte para transparencia
  const resolveColor = (position: "top" | "bottom"): string => {
    // Manejar fadeToTransparent primero
    if (fadeToTransparent) {
      if (fadeToTransparent === "both") return "transparent";
      if (fadeToTransparent === position) return "transparent";
    }

    // Obtener configuración de color
    const colorConfig = position === "top" ? topColor : bottomColor;
    
    // Si es string, usar para ambos temas
    if (typeof colorConfig === "string") return colorConfig;
    
    // Si es objeto, seleccionar según tema
    if (colorConfig) return colorConfig[theme];
    
    // Default del tema
    return themeDefaults[theme][position];
  };

  // Determinar colores finales
  const top = resolveColor("top");
  const bottom = resolveColor("bottom");

  return (
    <div
      style={{
        position: "relative",
        height: `${height}px`,
        background: flip
          ? `linear-gradient(to bottom, ${bottom} 0%, ${top} 100%)`
          : `linear-gradient(to bottom, ${top} 0%, ${bottom} 100%)`,
        marginTop: flip ? "0" : `-${height}px`,
        marginBottom: flip ? `-${height}px` : "0",
        zIndex: 1,
        transition: "background 500ms cubic-bezier(0.4, 0, 0.2, 1)"
      }}
    />
  );
};

export default FadeSeparator;