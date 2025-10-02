"use client";

import Image from "next/image";

const testImage2 = "/1.jpeg";
const testImage1 = "/2.jpeg";
const testImage3 = "/3.jpeg";

const AboutMe = () => {
  return (
    <section className="px-6 py-16 md:py-24 lg:py-32 transition-all duration-300 bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
          {/* Sección de Imágenes */}
          <div className="w-full lg:w-1/2">
            <div className="grid grid-cols-2 gap-6">
              <div className="relative h-80 rounded-2xl overflow-hidden shadow-2xl transform transition-transform duration-500 hover:scale-[1.02]">
                <Image
                  src={testImage1}
                  alt="Dominique Arvedson 1"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
              <div className="relative h-80 rounded-2xl overflow-hidden shadow-2xl transform transition-transform duration-500 hover:scale-[1.02]">
                <Image
                  src={testImage2}
                  alt="Dominique Arvedson 2"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
            </div>
            <div className="mt-6">
              <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl transform transition-transform duration-500 hover:scale-[1.02]">
                <Image
                  src={testImage3}
                  alt="Dominique Arvedson 3"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
            </div>
          </div>

          {/* Sección de Texto */}
          <div className="w-full lg:w-1/2 space-y-8 pt-8">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-[var(--primary)] relative inline-block">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] to-purple-600 ">
                Sobre Mí
              </span>
              <span className="absolute -bottom-2 left-0 w-1/3 h-1 bg-[var(--primary)] rounded-full" />
            </h2>

            <blockquote className="text-2xl md:text-3xl font-medium leading-tight border-l-4 border-[var(--primary)] pl-6 italic">
              El arte es la manifestación física de nuestra conexión emocional
              con el espacio
            </blockquote>

            <div className="space-y-6 text-lg md:text-xl text-[var(--muted2)]">
              <p className="leading-relaxed">
                Como{" "}
                <strong className="text-[var(--primary)]">
                  diseñadora industrial
                </strong>{" "}
                y artista profesional con más de una década de experiencia, mi
                trabajo trasciende la simple estética para crear{" "}
                <strong>experiencias sensoriales completas</strong>.
              </p>

              <p className="leading-relaxed">
                Cada pieza que diseño es un{" "}
                <strong>diálogo entre la forma y la emoción</strong>, donde la
                innovación técnica se encuentra con la expresión artística. Mis
                obras han sido descritas como{" "}
                <em>portales hacia estados de conciencia elevados</em> por
                críticos internacionales.
              </p>

              {/* Card responsive al tema */}
              <div className="p-6 rounded-xl border bg-[var(--card)] text-[var(--foreground)] border-[var(--border)] shadow-sm">
                <p className="mb-4 font-semibold text-[var(--primary)]">
                  📌 Filosofía de diseño:
                </p>
                <ul className="space-y-3 list-disc pl-6">
                  <li>Armonía dimensional entre espacio y volumen</li>
                  <li>Materiales sostenibles con alta tecnología</li>
                  <li>Narrativas visuales multisensoriales</li>
                </ul>
              </div>

              <p className="leading-relaxed">
                Especializada en <strong>instalaciones site-specific</strong>,
                mi proceso creativo integra:
              </p>

              <div className="grid grid-cols-2 gap-4 text-center">
                <span className="px-4 py-2 bg-[var(--secondary)] text-[var(--foreground)] rounded-full border border-[var(--border)]">
                  Realidad aumentada
                </span>
                <span className="px-4 py-2 bg-[var(--secondary)] text-[var(--foreground)] rounded-full border border-[var(--border)]">
                  Biomateriales
                </span>
                <span className="px-4 py-2 bg-[var(--secondary)] text-[var(--foreground)] rounded-full border border-[var(--border)]">
                  Kinética lumínica
                </span>
                <span className="px-4 py-2 bg-[var(--secondary)] text-[var(--foreground)] rounded-full border border-[var(--border)]">
                  Geometría emocional
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutMe;
