"use client";

import useTheme from "@/hooks/useTheme";
import {
  ShoppingBagIcon,
  ViewfinderCircleIcon,
  TrophyIcon,
} from "@heroicons/react/24/solid";
import Image from "next/image";

export default function StoreInvitation() {
  const theme = useTheme();

  return (
    <section
      className={`relative py-6 md:py-24 overflow-hidden fade-in ${
        theme === "dark" ? "bg-gray-900" : "bg-[var(--primary-bg)]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Galería visual */}
          <div className="relative grid grid-cols-2 grid-rows-2 gap-4 h-[500px]">
            <div className="relative rounded-xl overflow-hidden shadow-2xl transform transition-all duration-500 hover:scale-95">
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] opacity-20" />
              <Image
                src="/hero3.jpg"
                alt="Caballo en acuarela"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="relative rounded-xl overflow-hidden shadow-2xl transform transition-all duration-500 hover:scale-95">
              <Image
                src="/textura2.png"
                alt="Arte abstracto moderno"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative col-span-2 rounded-xl overflow-hidden shadow-2xl transform transition-all duration-500 hover:scale-95">
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--primary)] to-transparent opacity-10" />
              <Image
                src="/IMG_4849.jpg"
                alt="Colección de cuadros"
                fill
                className="object-cover"
              />
              <div className="absolute bottom-4 left-4 flex items-center space-x-2 bg-[var(--card)] px-4 py-2 rounded-lg shadow-md">
                <TrophyIcon className="h-6 w-6 text-[var(--accent)]" />
                <span className="font-medium text-[var(--foreground)]">
                  +500 Cuadros vendidos; se el proximo!
                </span>
              </div>
            </div>
          </div>

          {/* Contenido persuasivo */}
          <div
            className={`space-y-6 ${
              theme === "dark" ? "text-gray-100" : "text-[var(--foreground)]"
            }`}
          >
            <ViewfinderCircleIcon className="h-12 w-12 text-[var(--accent)] animate-pulse" />
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Descubre Obras Maestras
              <br />
              <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
                en Nuestra Galería
              </span>
            </h2>

            <p className="text-xl md:text-2xl leading-relaxed opacity-90">
              Transforma tus espacios con arte seleccionado por expertos.
              Encuentra la pieza perfecta que hable por tus paredes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <a
                href="/tienda"
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-[var(--text-on-primary)] font-bold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <ShoppingBagIcon className="h-6 w-6" />
                Explorar Tienda
              </a>
              <a
                href="/CATÁLOGO 2025 ARVEDSON.ART (1).pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 rounded-xl border-2 border-[var(--primary)] text-[var(--primary)] font-bold hover:bg-[var(--primary)] hover:text-[var(--text-on-primary)] transition-all duration-300 flex items-center justify-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6"
                >
                  <path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625Z" />
                  <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
                </svg>
                Ver Catálogo
              </a>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-4 opacity-90">
              <div className="text-center">
                <div className="text-3xl font-bold text-[var(--primary)]">
                  100%
                </div>
                <div className="text-sm">Personalizado</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[var(--primary)]">
                  ✈️
                </div>
                <div className="text-sm">Envíos Gratis a todo Mexico</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
