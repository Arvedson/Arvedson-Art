"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import useTheme from "@/hooks/useTheme";

const images = [
    "/IMG_7118 (1).JPG",
  
  "/hero2.jpg",
  "/hero3.jpg",
"/hero1.jpg",
  "/hero4.jpg",
  
];

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const theme = useTheme();
  const imageRef = useRef<HTMLDivElement>(null);
  const transitionLock = useRef(false);
  const zIndices = useRef(images.map((_, i) => images.length - i));
  const [logoSrc, setLogoSrc] = useState("/1.svg");
  const [logoOpacity, setLogoOpacity] = useState(1);

  // Efecto parallax mejorado
  useEffect(() => {
    const handleScroll = () => {
      if (!imageRef.current) return;
      
      const scrollY = window.scrollY || window.pageYOffset;
      const offset = scrollY * 0.5;
      imageRef.current.style.transform = `translate3d(0, ${offset}px, 0)`;
    };

    const throttledScroll = () => requestAnimationFrame(handleScroll);
    window.addEventListener('scroll', throttledScroll);
    return () => window.removeEventListener('scroll', throttledScroll);
  }, []);

  // Transición suave entre imágenes
  const startTransition = useCallback(() => {
    if (transitionLock.current) return;
    transitionLock.current = true;

    // Actualizar z-indices para la transición
    zIndices.current = zIndices.current.map((z, i) => 
      i === currentIndex ? images.length : z - 1
    );

    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % images.length);
      
      // Reorganizar z-indices después de la transición
      setTimeout(() => {
        zIndices.current = zIndices.current.map((_, i) => 
          (i + currentIndex) % images.length
        );
        transitionLock.current = false;
      }, 100);
    }, 1000); // Duración de la transición
  }, [currentIndex]);

  // Control del intervalo de transición
  useEffect(() => {
    const interval = setInterval(startTransition, 5000);
    return () => clearInterval(interval);
  }, [startTransition]);

    // Logo change with opacity transition
    useEffect(() => {
        // Fade out
        setLogoOpacity(0);
        // Use a timeout to control the fade and switch
        const timer = setTimeout(() => {
            setLogoSrc(theme === "light" ? "/1.svg" : "/2.svg");
            // Fade in
            setLogoOpacity(1);
        }, 500); // 500ms matches the CSS transition

        return () => clearTimeout(timer);

    }, [theme]);

  return (
    <div className={`relative w-full h-[90vh] overflow-hidden ${theme === "light" ? "bg-white" : "bg-gray-900"}`}>
      <div
        ref={imageRef}
        className="absolute inset-0 will-change-transform"
        style={{ transition: 'transform 0.1s linear' }}
      >
        {images.map((img, index) => (
          <div
            key={index}
            className="absolute inset-0"
            style={{
              zIndex: zIndices.current[index],
              opacity: index === currentIndex ? 1 : 0,
              transition: 'opacity 1s ease-in-out'
            }}
          >
            <Image
              src={img}
              alt={`Hero image ${index + 1}`}
              fill
              className="object-cover"
              sizes="100vw"
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      <div className={`absolute inset-0 flex items-center justify-center z-50 ${
        theme === "light" ? "bg-black/30" : "bg-black/70"
      }`}>
        <Image
          src={logoSrc}
          alt="Logo"
          // Utilizamos clases de Tailwind para el tamaño responsive
          className="min-w-[600px] w-80 sm:w-[1200px] transition-all duration-500 p-6"
          style={{ opacity: logoOpacity }}
          width={1500}  // Añadimos width y height.  Estos valores deben ser el tamaño máximo que el logo va a tener.
          height={1500}
        />
      </div>
    </div>
  );
}

