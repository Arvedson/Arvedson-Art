"use client";

import { useEffect, useState } from "react";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Inicializar el tema solo en el cliente
    const initializeTheme = () => {
      try {
        const savedTheme = localStorage.getItem("theme");
        const systemPrefersDark =
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches;
        const theme = savedTheme || (systemPrefersDark ? "dark" : "light");
        document.documentElement.setAttribute("data-theme", theme);
      } catch (e) {
        document.documentElement.setAttribute("data-theme", "light");
      }
    };

    initializeTheme();
  }, []);

  // Evitar renderizado hasta que estemos en el cliente
  if (!isClient) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
