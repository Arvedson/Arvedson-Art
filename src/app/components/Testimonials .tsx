"use client";

import { useEffect, useState } from "react";
import useTheme from "@/hooks/useTheme";

type Testimonial = {
  id: number;
  name: string;
  testimonial: string;
  rating: number;
  createdAt: string;
};

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme(); // Usamos el hook para obtener el tema actual

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch("/api/testimonials");
        if (!response.ok) throw new Error("Error al obtener los testimonios");
        const data = await response.json();
        setTestimonials(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  console.log("Tema actual:", theme); // Para depurar el valor del tema


  if (loading) {
    return (
      <p
        className={`text-center p-4 transition-colors duration-300 ${
          theme === "light" ? "text-[var(--foreground)]" : "text-[var(--background)]"
        }`}
      >
        Cargando comentarios...
      </p>
    );
  }

  return (
<div
  className={`container mx-auto h-auto p-6 transition-colors duration-300 ${
    theme === "dark" ? "bg-[var(--primaryblue)]" : "bg-[var(--background)]"
  }`}
>

      <h1
        className={`text-4xl font-bold text-center mb-8 transition-colors duration-300 ${
          theme === "light" ? "text-[var(--primary)]" : "text-[var(--primary)]"
        }`}
      >
        Comentarios
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            className={`group rounded-lg shadow-lg p-6 transition-shadow duration-300 hover:shadow-xl border ${
              theme === "light"
                ? "bg-[var(--muted)] border-[var(--border)]"
                : "bg-[var(--secondary)] border-[var(--primary)]"
            }`}
          >
            <h2
              className={`text-lg font-bold truncate ${
                theme === "light" ? "text-[var(--foreground)]" : "text-[var(--foreground)]"
              }`}
            >
              {testimonial.name}
            </h2>
            <p
              className={`text-sm mt-2 ${
                theme === "light" ? "text-[var(--foreground)]" : "text-[var(--foreground)]"
              }`}
            >
              {testimonial.testimonial}
            </p>
            <span
              className={`block mt-4 font-semibold ${
                theme === "light" ? "text-[var(--primary)]" : "text-[var(--primary)]"
              }`}
            >
              Calificación: {testimonial.rating}/5
            </span>
            <p
              className={`text-xs mt-2 ${
                theme === "light" ? "text-[var(--foreground)]" : "text-[var(--foreground)]"
              }`}
            >
              {new Date(testimonial.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
