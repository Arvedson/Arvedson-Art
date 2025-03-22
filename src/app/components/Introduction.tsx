"use client";

import useTheme from "@/hooks/useTheme";
import {
  HomeModernIcon,
  SparklesIcon,
  PaintBrushIcon,
  BuildingLibraryIcon,
} from "@heroicons/react/24/solid";

export default function Introduction() {
  const theme = useTheme();

  const items = [
    {
      icon: <HomeModernIcon className="h-12 w-12 text-[var(--primary)]" />,
      message: "Cuadros personalizados para todo tipo de espacio.",
    },
    {
      icon: <SparklesIcon className="h-12 w-12 text-[var(--primary)]" />,
      message: "No es el cuadro perfecto para un lugar, es el lugar perfecto para un cuadro.",
    },
    {
      icon: <PaintBrushIcon className="h-12 w-12 text-[var(--primary)]" />,
      message: "Haz de tus espacios un reflejo único de tu personalidad.",
    },
    {
      icon: <BuildingLibraryIcon className="h-12 w-12 text-[var(--primary)]" />,
      message: "Diseño artístico pensado para tu hogar o tu lugar de trabajo.",
    },
  ];

  return (
    <section
      className={`min-h-[50vh] px-6 py-12 fade-in transition-all duration-300 ${
        theme === "light"
          ? "bg-[var(--background)] text-[var(--foreground)]"
          : "bg-gray-900 text-gray-100"
      }`}
    >
      <h2
        className={`text-3xl md:text-4xl font-bold mb-10 text-center ${
          theme === "light"
            ? "text-[var(--primary)]"
            : "text-[var(--primary)]"
        }`}
      >
        Bienvenidos!
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-7xl mx-auto">
        {items.map((item, index) => (
          <div
            key={index}
            className={`flex flex-col items-center text-center space-y-4 p-6 rounded-lg shadow-md transition-transform duration-300 hover:scale-105 h-full justify-center ${
              theme === "light" ? "bg-[var(--muted)]" : "bg-[var(--secondary)] text-gray-200"
            }`}
          >
            {item.icon}
            <p
              className={`text-lg md:text-xl font-medium ${
                theme === "light" ? "text-[var(--foreground)]" : "text-gray-200"
              }`}
            >
              {item.message}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}