"use client";

import useTheme from "@/hooks/useTheme";
import {
  HomeModernIcon,
  SparklesIcon,
  PaintBrushIcon,
  BuildingLibraryIcon,
} from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Introduction() {
  const theme = useTheme();

  const items = [
    {
      icon: <HomeModernIcon className="h-8 w-8" />,
      message: "Cuadros personalizados para todo tipo de espacio",
    },
    {
      icon: <SparklesIcon className="h-8 w-8" />,
      message: "El lugar perfecto para tu cuadro ideal",
    },
    {
      icon: <PaintBrushIcon className="h-8 w-8" />,
      message: "Reflejo único de tu personalidad",
    },
    {
      icon: <BuildingLibraryIcon className="h-8 w-8" />,
      message: "Arte para hogares y espacios profesionales",
    },
  ];

  return (
    <section className={`relative py-12 md:py-24 overflow-hidden fade-in ${
      theme === 'dark' ? 'bg-[var(--background)]' : 'bg-[var(--primary-bg)]'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-center">
          {/* Contenido textual */}
          <div className="space-y-6 md:space-y-8 px-4 sm:px-0">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <SparklesIcon className="h-10 w-10 md:h-12 md:w-12 text-[var(--accent)] mb-4 md:mb-6 animate-pulse" />
              <h2 className="text-3xl md:text-5xl font-bold leading-tight text-wrap balance">
                Transforma tus espacios con{" "}
                <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
                  arte único
                </span>
              </h2>
              <p className="text-lg md:text-xl mt-4 md:mt-6 opacity-90 leading-relaxed text-[var(--muted2)]">
                Donde cada obra cuenta una historia y cada detalle está pensado
                para inspirar tus momentos.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-8 md:mt-12">
              {items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 md:p-6 rounded-xl transition-all duration-300 group ${
                    theme === 'dark' 
                      ? 'bg-[var(--card)] hover:bg-[var(--secondary)]' 
                      : 'bg-[var(--white)] hover:bg-[var(--muted)]'
                  }`}
                >
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="p-2 md:p-3 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-[var(--text-on-primary)]">
                      {item.icon}
                    </div>
                    <p className="text-base md:text-lg text-[var(--text-on-accent)] font-medium mt-1 md:mt-2 break-words whitespace-normal">
                      {item.message}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Galería visual - Corregida la visibilidad */}
          <div className="hidden sm:grid relative grid-cols-2 grid-rows-[40%_60%] gap-4 h-[500px] md:h-[600px]">
            <motion.div 
              className="relative rounded-2xl overflow-hidden shadow-2xl"
              whileHover={{ scale: 0.98 }}
            >
              <Image
                src="/IMG_7119 (1).JPG"
                alt="Composición artística contemporánea"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectPosition: 'center 30%' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--primary)]/20 to-transparent" />
            </motion.div>
            
            <motion.div 
              className="relative rounded-2xl overflow-hidden shadow-2xl"
              whileHover={{ scale: 0.98 }}
            >
              <Image
                src="/IMG_5746 (1).jpg"
                alt="Detalles de textura y profundidad"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectPosition: 'center 65%' }}
              />
            </motion.div>
            
            <motion.div 
              className="relative col-span-2 rounded-2xl overflow-hidden shadow-2xl"
              whileHover={{ scale: 0.98 }}
            >
              <Image
                src="/IMG_5928 (1).jpg"
                alt="Integración arquitectónica de obras"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 100vw"
                style={{ objectPosition: 'center 40%' }}
              />
              <div className="absolute bottom-6 left-6 bg-[var(--card)] px-6 py-3 rounded-full shadow-md flex items-center gap-2">
                <PaintBrushIcon className="h-6 w-6 text-[var(--accent)]" />
                <span className="font-medium text-[var(--muted2)]">Desde 2015 creando arte</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}