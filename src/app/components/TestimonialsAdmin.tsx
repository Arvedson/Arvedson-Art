// TestimonialsAdmin.tsx

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

export default function TestimonialsAdmin() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

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

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch("/api/testimonials", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setTestimonials(testimonials.filter((testimonial) => testimonial.id !== id));
      } else {
        console.error("Error al eliminar el testimonio");
      }
    } catch (error) {
      console.error("Error al eliminar el testimonio:", error);
    }
  };

  if (loading) {
    return (
      <p
        className={`text-center p-4 transition-colors duration-300 ${
          theme === "light" ? "text-[var(--foreground)]" : "text-[var(--background)]"
        }`}
      >
        Cargando testimonios...
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
        Testimonios (Admin)
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
            <button
              onClick={() => handleDelete(testimonial.id)}
              className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
