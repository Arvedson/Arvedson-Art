"use client";
import React, { useEffect, useRef } from "react";
import {
  ShieldCheckIcon,
  PencilSquareIcon,
  TruckIcon,
  ChatBubbleBottomCenterTextIcon,
} from "@heroicons/react/24/solid";
import useTheme from "@/hooks/useTheme";

const About = () => {
  const theme = useTheme();
  const parallaxRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        if (parallaxRef.current) {
          parallaxRef.current.style.transform = `translateY(${scrollY * 0.5}px)`;
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Configuración de clases basadas en el tema
  const themeClasses = {
    bgPage: theme === 'light' ? 'bg-[var(--background)]' : 'bg-[var(--primaryblue)]',
    textPrimary: theme === 'light' ? 'text-[var(--foreground)]' : 'text-[var(--foreground)]',
    sectionBg: theme === 'light' ? 'bg-[var(--muted)]' : 'bg-[var(--secondary)]',
    overlayColor: theme === 'light' ? 'var(--muted)' : 'var(--secondary)',
    accentBorder: theme === 'light' ? 'border-[var(--primary)]' : 'border-[var(--primary)]', // Cambiado
    status: {
      error: theme === 'light' ? 'text-red-600' : 'text-red-300',
      success: theme === 'light' ? 'text-green-600' : 'text-green-300'
    }
  };

  return (
    <div className={`min-h-screen ${themeClasses.bgPage} ${themeClasses.textPrimary}`}>
      {/* Hero Section con Parallax */}
      <div className="relative h-[400px] overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          <img
            ref={parallaxRef}
            src="/IMG_4849.jpg"
            alt="Fondo artístico"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-out"
            style={{ transform: 'translateY(0)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)] to-[var(--primary)] opacity-70" />
        </div>
        
        <div className="relative z-10 text-center text-[var(--background)]">
          <h1 className="text-5xl font-bold mb-4">Sobre Nosotros</h1>
          <p className="text-xl">
            Transformamos tus ideas en obras de arte personalizadas.
          </p>
        </div>
      </div>

      {/* Introduction Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">¿Quiénes Somos?</h2>
          <p className="text-lg mb-8">
            En <strong className="text-[var(--primary)]">Arvedson • Art</strong>, nos
            apasiona crear cuadros personalizados que capturen tus momentos más
            especiales. Con años de experiencia en el arte y la personalización,
            nos enorgullece ofrecer productos de alta calidad y un servicio
            excepcional.
          </p>
          <p className="text-lg">
            Hacemos envíos a todo México, llevando arte y creatividad a cada
            rincón del país.
          </p>
        </div>
      </div>

      {/* Process Section - Imagen estática */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/IMG_7118 (1).JPG"
            alt="Fondo de proceso"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div 
            className="absolute inset-0"
            style={{ 
              backgroundColor: themeClasses.overlayColor,
              opacity: 0.7
            }}
          />
        </div>
        
        <div className="relative z-10 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">
              Nuestro Proceso
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((step) => (
                <div key={step} className="text-center">
                  <div className="bg-[var(--primary)] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-[var(--background)] text-2xl font-bold">
                      {step}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {step === 1 && "Ideas"}
                    {step === 2 && "Diseño"}
                    {step === 3 && "Entrega"}
                  </h3>
                  <p className="text-[var(--foreground)]">
                    {step === 1 &&
                      "Nos cuentas tu idea y nos compartes detalles como colores, estilos y dimensiones."}
                    {step === 2 &&
                      "Creamos un diseño único y te lo presentamos para aprobación."}
                    {step === 3 &&
                      "Fabricamos tu cuadro y lo enviamos a cualquier parte de México."}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          ¿Por Qué Elegirnos?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <ShieldCheckIcon className="h-20 w-20 text-[var(--primary)] mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Calidad Premium</h3>
            <p>
              Materiales de alta durabilidad y acabados impecables.
            </p>
          </div>

          <div className="text-center">
            <PencilSquareIcon className="h-20 w-20 text-[var(--primary)] mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">100% Personalizado</h3>
            <p>
              Cada cuadro es único y hecho a medida.
            </p>
          </div>

          <div className="text-center">
            <TruckIcon className="h-20 w-20 text-[var(--primary)] mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Envíos a Todo México</h3>
            <p>
              Llevamos tu cuadro hasta la puerta de tu casa.
            </p>
          </div>

          <div className="text-center">
            <ChatBubbleBottomCenterTextIcon className="h-20 w-20 text-[var(--primary)] mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Soporte Personalizado</h3>
            <p>
              Estamos contigo en cada paso del proceso.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]  py-16 text-center">
        <h2 className="text-3xl font-bold text-[var(--background)] mb-6">
          ¿Listo para Crear Algo Increíble?
        </h2>
        <p className="text-[var(--background)] text-lg mb-8">
          Contáctanos hoy mismo y comienza a personalizar tu cuadro.
        </p>
        <a
          href="/contact"
          className="bg-[var(--background)] text-[var(--primary)] px-8 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity duration-300"
        >
          Contáctanos
        </a>
      </div>
    </div>
  );
};

export default About;