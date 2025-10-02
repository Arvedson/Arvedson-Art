"use client";
import React, { useEffect, useRef } from "react";
import {
  PencilSquareIcon,
  PhotoIcon,
  SparklesIcon,
  TruckIcon,
  CurrencyDollarIcon,
  HeartIcon,
} from "@heroicons/react/24/solid";
import useTheme from "@/hooks/useTheme";

const Services = () => {
  const theme = useTheme();
  const parallaxRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        if (parallaxRef.current) {
          parallaxRef.current.style.transform = `translateY(${
            scrollY * 0.5
          }px)`;
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const themeClasses = {
    overlayColor: theme === "light" ? "var(--muted)" : "var(--secondary)",
    gradientOpacity: theme === "light" ? 0.7 : 0.6,
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Hero Section con Parallax */}
      <div className="relative h-[400px] overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          <img
            ref={parallaxRef}
            src="/textura1.jpeg"
            alt="Textura de fondo"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-out"
            style={{ transform: "translateY(0)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: themeClasses.overlayColor,
              opacity: 0.6,
            }}
          />
        </div>
        <div className="relative z-10 text-center text-[var(--background)]">
          <h1 className="text-5xl text-[var(--primary)]  font-bold mb-4">
            Nuestros Servicios
          </h1>
          <p className="text-xl text-[var(--foreground)]">
            Transformamos tus recuerdos en arte perdurable
          </p>
        </div>
      </div>

      {/* Servicios Destacados */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-6">Lo que Ofrecemos</h2>
          <p className="text-lg text-[var(--foreground)]">
            Creación artesanal con los más altos estándares de calidad
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {[
            {
              icon: PencilSquareIcon,
              title: "Pinturas Personalizadas",
              description: "Óleos y acrílicos sobre lienzo de calidad museo",
              features: ["Diseño único", "Hasta 2m x 2m", "Marco incluido"],
            },
            {
              icon: PhotoIcon,
              title: "Fotos en Lienzo",
              description: "Impresión HD con acabado profesional",
              features: ["Hasta 8K", "Resistente a humedad", "20+ tamaños"],
            },
            {
              icon: SparklesIcon,
              title: "Arte Digital",
              description: "Creaciones digitales para decoración moderna",
              features: [
                "Vectorizado profesional",
                "Formatos 4K/8K",
                "Animaciones",
              ],
            },
            {
              icon: HeartIcon,
              title: "Diseño Personalizado",
              description: "Nuestros artistas realizan tu visión",
              features: [
                "3 revisiones",
                "Asesoría profesional",
                "Entrega rápida",
              ],
            },
            {
              icon: TruckIcon,
              title: "Envío Nacional",
              description: "Entrega protegida en todo México",
              features: ["Rastreo GPS", "Embalaje especial", "Seguro incluido"],
            },
            {
              icon: CurrencyDollarIcon,
              title: "Financiamiento",
              description: "Facilidades de pago",
              features: [
                "Meses sin intereses",
                "Opciones corporativas",
                "Cotización inmediata",
              ],
            },
          ].map((service, index) => (
            <div
              key={index}
              className="p-8 rounded-xl transition-all duration-300 bg-[var(--card)] hover:bg-[var(--secondary)] border border-[var(--border)] shadow-sm hover:shadow-md"
            >
              <service.icon className="h-16 w-16 text-[var(--primary)] mb-6 mx-auto" />
              <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
              <p className="mb-6 text-[var(--foreground)]">
                {service.description}
              </p>
              <ul className="space-y-2">
                {service.features.map((feature, fIndex) => (
                  <li
                    key={fIndex}
                    className="flex items-center text-[var(--foreground)]"
                  >
                    <svg
                      className="w-4 h-4 mr-2 text-[var(--primary)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Sección combinada con imagen continua */}
      <div className="relative overflow-hidden">
        {/* Imagen de fondo continua para ambas secciones */}
        <div className="absolute inset-0">
          <img
            src="/hero3.jpg"
            alt="Detalle artístico"
            className="w-full h-full object-cover"
          />
          {/* Degradado combinado para ambas secciones */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, ${themeClasses.overlayColor} 0%, transparent 50%, ${themeClasses.overlayColor} 100%)`,
              opacity: themeClasses.gradientOpacity,
            }}
          />
        </div>

        {/* Primera sección: ¿Cómo Funciona? */}
        <div className="relative z-10 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2
              className={`text-3xl font-bold text-center mb-12 ${
                theme === "light"
                  ? "text-[var(--foreground)]"
                  : "text-[var(--background)]"
              }`}
            >
              ¿Cómo Funciona?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { title: "Consulta", text: "Cuéntanos tu idea" },
                { title: "Diseño", text: "Creación del concepto" },
                { title: "Producción", text: "Fabricación artesanal" },
                { title: "Entrega", text: "Instalación opcional" },
              ].map((step, index) => (
                <div key={index} className="text-center">
                  <div className="bg-[var(--primary)] text-[var(--background)] w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    {index + 1}
                  </div>
                  <h3
                    className={`text-xl font-semibold mb-2 ${
                      theme === "light"
                        ? "text-[var(--foreground)]"
                        : "text-[var(--background)]"
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p
                    className={
                      theme === "light"
                        ? "text-[var(--foreground)]"
                        : "text-[var(--background)]"
                    }
                  >
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Segunda sección: Listo para Empezar */}
        <div className="relative z-10 py-16 text-center">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2
              className={`text-3xl font-bold mb-6 ${
                theme === "light"
                  ? "text-[var(--foreground)]"
                  : "text-[var(--background)]"
              }`}
            >
              ¿Listo para Empezar?
            </h2>
            <p
              className={`text-lg mb-8 ${
                theme === "light"
                  ? "text-[var(--foreground)]"
                  : "text-[var(--background)]"
              }`}
            >
              Solicita una cotización personalizada sin compromiso
            </p>
            <a
              href="/contact"
              className="inline-block bg-[var(--background)] text-[var(--primary)] px-8 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity duration-300"
            >
              Contactar Ahora
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
