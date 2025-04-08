"use client";
import { useState } from "react";
import Gallery2 from "@/app/components/Gallery2";
import UploadArtwork from "@/app/components/UploadArtwork";
import TestimonialsAdmin from "@/app/components/TestimonialsAdmin";
import StockGallery from "@/app/components/StockGallery ";
import UploadStockArtwork from "@/app/components/UploadStockArtwork ";
import FrameCost from "@/app/components/shop/FrameCost";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<
    "upload" | "gallery" | "testimonials" | "stock" | "prices"
  >("upload");
  const [activeForm, setActiveForm] = useState<"artwork" | "stock" | "testimonial">("artwork");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Panel de Administración</h1>
        
        {/* Navegación principal actualizada */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab("upload")}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === "upload"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Subir Contenido
          </button>
          <button
            onClick={() => setActiveTab("gallery")}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === "gallery"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Galería de Réplicas
          </button>
          <button
            onClick={() => setActiveTab("stock")}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === "stock"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Cuadros en Stock
          </button>
          <button
            onClick={() => setActiveTab("testimonials")}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === "testimonials"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Testimonios
          </button>
          <button
            onClick={() => setActiveTab("prices")}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === "prices"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Gestión de Precios
          </button>
        </div>

        {/* Contenido actualizado con la nueva sección */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {activeTab === "upload" && (
            <div>
              <div className="flex justify-center gap-4 mb-6">
                <button
                  onClick={() => setActiveForm("artwork")}
                  className={`px-4 py-2 rounded-md font-medium ${
                    activeForm === "artwork"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  Subir Réplica
                </button>
                <button
                  onClick={() => setActiveForm("stock")}
                  className={`px-4 py-2 rounded-md font-medium ${
                    activeForm === "stock"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  Subir Stock
                </button>
                <button
                  onClick={() => setActiveForm("testimonial")}
                  className={`px-4 py-2 rounded-md font-medium ${
                    activeForm === "testimonial"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
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
              <h2 className="text-2xl font-semibold text-gray-800">Gestión de Precios de Marcos</h2>
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nombre
        </label>
        <input
          type="text"
          name="name"
          id="name"
          placeholder="Nombre del cliente"
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="testimonial" className="block text-sm font-medium text-gray-700">
          Testimonio
        </label>
        <textarea
          name="testimonial"
          id="testimonial"
          placeholder="Escribe el testimonio del cliente"
          value={formData.testimonial}
          onChange={handleChange}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="rating" className="block text-sm font-medium text-gray-700">
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
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        Subir Testimonio
      </button>
    </form>
  );
}
