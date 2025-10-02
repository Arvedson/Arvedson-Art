import { useEffect, useState } from "react";

export default function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Marcar que estamos en el cliente
    setIsClient(true);

    // Obtener el tema actual del DOM
    const currentTheme = document.documentElement.getAttribute("data-theme");
    if (currentTheme) {
      setTheme(currentTheme as "light" | "dark");
    }

    // Observar cambios en el DOM (para cuando se cambie el tema desde otros componentes)
    const observer = new MutationObserver(() => {
      const newTheme = document.documentElement.getAttribute("data-theme");
      const themeValue = (newTheme as "light" | "dark") || "light";
      if (themeValue !== theme) {
        setTheme(themeValue);
        // Guardar en localStorage cuando cambie
        try {
          localStorage.setItem("theme", themeValue);
        } catch (e) {
          // Ignorar errores de localStorage
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, [theme]);

  // En el servidor, siempre retornar "light" para evitar hidratación inconsistente
  if (!isClient) {
    return "light";
  }

  return theme;
}
