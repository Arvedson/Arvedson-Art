"use client";

import { useEffect, useState } from "react";
import useTheme from "@/hooks/useTheme";
import { StarIcon } from "@heroicons/react/24/solid";

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
  const [showAll, setShowAll] = useState(false);
  const [expandedTestimonial, setExpandedTestimonial] = useState<number | null>(null);
  const limit = 3;
  const theme = useTheme();

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch("/api/testimonials");
        if (!response.ok) {
          throw new Error("Error al obtener los testimonios");
        }
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

  const visibleTestimonials = showAll ? testimonials : testimonials.slice(0, limit);

  const toggleShowAll = () => {
    setShowAll(!showAll);
  };

  const toggleExpandTestimonial = (id: number) => {
    setExpandedTestimonial(expandedTestimonial === id ? null : id);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <StarIcon
          key={i}
          className={`h-5 w-5 ${i < rating ? "text-yellow-500" : "text-gray-400"}`}
        />
      );
    }
    return <span className="flex items-center">{stars}</span>;
  };

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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-8">
        {visibleTestimonials.map((testimonial) => {
          const isLongTestimonial = testimonial.testimonial.length > 100;
          const displayTestimonial = expandedTestimonial === testimonial.id
            ? testimonial.testimonial
            : isLongTestimonial
              ? `${testimonial.testimonial.substring(0, 100)}...`
              : testimonial.testimonial;

          return (
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
                className={`text-sm mt-2 flex flex-wrap items-baseline ${
                  theme === "light" ? "text-[var(--foreground)]" : "text-[var(--foreground)]"
                }`}
              >
                {displayTestimonial}
                {isLongTestimonial && (
                  <button
                    onClick={() => toggleExpandTestimonial(testimonial.id)}
                    className={`ml-1 mt-2 text-sm font-semibold p-2 align-baseline ${
                      theme === "light" ? "text-[var(--secondary)]" : "text-[var(--secondary)]"
                    }`}
                  >
                    {expandedTestimonial === testimonial.id ? "Ver menos" : "Ver más"}
                  </button>
                )}
              </p>
              <div className="mt-4 font-semibold flex items-center">
                {renderStars(testimonial.rating)}
              </div>
              <p
                className={`text-xs mt-2 ${
                  theme === "light" ? "text-[var(--foreground)]" : "text-[var(--foreground)]"
                }`}
              >
                {new Date(testimonial.createdAt).toLocaleDateString()}
              </p>
            </div>
          );
        })}
      </div>
      {testimonials.length > limit && (
        <div className="text-center mt-4">
          <button
            onClick={toggleShowAll}
            className={`px-4 py-2 rounded-md font-semibold ${
              theme === "light"
                ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                : "bg-gray-700 text-white hover:bg-gray-600"
            }`}
          >
            {showAll ? "Ver menos" : "Ver más comentarios"}
          </button>
        </div>
      )}
    </div>
  );
}
