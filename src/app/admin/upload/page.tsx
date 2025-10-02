"use client";
import { useState } from "react";
import Gallery2 from "@/app/components/Gallery2";
import UploadArtwork from "@/app/components/UploadArtwork";
import TestimonialsAdmin from "@/app/components/TestimonialsAdmin";
import StockGallery from "@/app/components/StockGallery ";
import UploadStockArtwork from "@/app/components/UploadStockArtwork ";
import FrameCost from "@/app/components/shop/FrameCost";
import useTheme from "@/hooks/useTheme";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<
    "upload" | "gallery" | "testimonials" | "stock" | "prices"
  >("upload");
  const [activeForm, setActiveForm] = useState<
    "artwork" | "stock" | "testimonial"
  >("artwork");
  const theme = useTheme();

  return (
    <div
      className={`min-h-screen ${
        theme === "dark" ? "bg-[var(--background)]" : "bg-[var(--primary-bg)]"
      }`}
    >
      <div className="container mx-auto px-4 py-8">
        <h1
          className={`text-3xl font-bold mb-8 text-center ${
            theme === "dark"
              ? "text-[var(--foreground)]"
              : "text-[var(--foreground)]"
          }`}
        >
          Panel de Administración
        </h1>

        {/* Navegación principal actualizada */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab("upload")}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === "upload"
                ? "bg-[var(--primary)] text-[var(--text-on-primary)]"
                : "bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--secondary)] border border-[var(--border)]"
            }`}
          >
            Subir Contenido
          </button>
          <button
            onClick={() => setActiveTab("gallery")}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === "gallery"
                ? "bg-[var(--primary)] text-[var(--text-on-primary)]"
                : "bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--secondary)] border border-[var(--border)]"
            }`}
          >
            Galería de Réplicas
          </button>
          <button
            onClick={() => setActiveTab("stock")}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === "stock"
                ? "bg-[var(--primary)] text-[var(--text-on-primary)]"
                : "bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--secondary)] border border-[var(--border)]"
            }`}
          >
            Cuadros en Stock
          </button>
          <button
            onClick={() => setActiveTab("testimonials")}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === "testimonials"
                ? "bg-[var(--primary)] text-[var(--text-on-primary)]"
                : "bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--secondary)] border border-[var(--border)]"
            }`}
          >
            Testimonios
          </button>
          <button
            onClick={() => setActiveTab("prices")}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === "prices"
                ? "bg-[var(--primary)] text-[var(--text-on-primary)]"
                : "bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--secondary)] border border-[var(--border)]"
            }`}
          >
            Gestión de Precios
          </button>
        </div>

        {/* Contenido actualizado con la nueva sección */}
        <div
          className={`rounded-lg shadow-md p-6 border ${
            theme === "dark"
              ? "bg-[var(--card)] border-[var(--border)]"
              : "bg-[var(--card)] border-[var(--border)]"
          }`}
        >
          {activeTab === "upload" && (
            <div>
              <div className="flex justify-center gap-4 mb-6">
                <button
                  onClick={() => setActiveForm("artwork")}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    activeForm === "artwork"
                      ? "bg-[var(--primary)] text-[var(--text-on-primary)]"
                      : "bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--muted)] border border-[var(--border)]"
                  }`}
                >
                  Subir Réplica
                </button>
                <button
                  onClick={() => setActiveForm("stock")}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    activeForm === "stock"
                      ? "bg-[var(--primary)] text-[var(--text-on-primary)]"
                      : "bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--muted)] border border-[var(--border)]"
                  }`}
                >
                  Subir Stock
                </button>
                <button
                  onClick={() => setActiveForm("testimonial")}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    activeForm === "testimonial"
                      ? "bg-[var(--primary)] text-[var(--text-on-primary)]"
                      : "bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--muted)] border border-[var(--border)]"
                  }`}
                >
                  Subir Testimonio
                </button>
              </div>

              {activeForm === "artwork" && <UploadArtwork />}
              {activeForm === "stock" && <UploadStockArtwork />}
              {activeForm === "testimonial" && <UploadTestimonial />}
            </div>
          )}

          {activeTab === "gallery" && <Gallery2 />}
          {activeTab === "stock" && <StockGallery />}
          {activeTab === "testimonials" && <TestimonialsAdmin />}
          {activeTab === "prices" && (
            <div className="space-y-6">
              <h2
                className={`text-2xl font-semibold ${
                  theme === "dark"
                    ? "text-[var(--foreground)]"
                    : "text-[var(--foreground)]"
                }`}
              >
                Gestión de Precios de Marcos
              </h2>
              <FrameCost />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
function UploadTestimonial() {
  const [formData, setFormData] = useState({
    name: "",
    testimonial: "",
    rating: "",
  });
  const theme = useTheme();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const res = await fetch("/api/testimonials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        rating: parseInt(formData.rating), // Convertimos el rating a número
      }),
    });

    if (res.ok) {
      alert("Testimonio subido exitosamente");
      setFormData({ name: "", testimonial: "", rating: "" });
    } else {
      alert("Hubo un error al subir el testimonio");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className={`block text-sm font-medium ${
            theme === "dark"
              ? "text-[var(--foreground)]"
              : "text-[var(--foreground)]"
          }`}
        >
          Nombre
        </label>
        <input
          type="text"
          name="name"
          id="name"
          placeholder="Nombre del cliente"
          value={formData.name}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] placeholder-[var(--muted2)] focus:border-[var(--primary)] focus:ring-[var(--primary)]`}
          required
        />
      </div>

      <div>
        <label
          htmlFor="testimonial"
          className={`block text-sm font-medium ${
            theme === "dark"
              ? "text-[var(--foreground)]"
              : "text-[var(--foreground)]"
          }`}
        >
          Testimonio
        </label>
        <textarea
          name="testimonial"
          id="testimonial"
          placeholder="Escribe el testimonio del cliente"
          value={formData.testimonial}
          onChange={handleChange}
          rows={4}
          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] placeholder-[var(--muted2)] focus:border-[var(--primary)] focus:ring-[var(--primary)]`}
          required
        />
      </div>

      <div>
        <label
          htmlFor="rating"
          className={`block text-sm font-medium ${
            theme === "dark"
              ? "text-[var(--foreground)]"
              : "text-[var(--foreground)]"
          }`}
        >
          Calificación (1 a 5)
        </label>
        <input
          type="number"
          name="rating"
          id="rating"
          placeholder="Calificación"
          value={formData.rating}
          onChange={handleChange}
          min={1}
          max={5}
          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] placeholder-[var(--muted2)] focus:border-[var(--primary)] focus:ring-[var(--primary)]`}
          required
        />
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-[var(--text-on-primary)] bg-[var(--primary)] hover:bg-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-colors"
      >
        Subir Testimonio
      </button>
    </form>
  );
}
