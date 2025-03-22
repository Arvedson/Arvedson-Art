
"use client";
import { useState } from "react";
import Gallery2 from "@/app/components/Gallery2";
import UploadArtwork from "@/app/components/UploadArtwork";
import TestimonialsAdmin from "@/app/components/TestimonialsAdmin";


export default function AdminPage() {
  const [activeForm, setActiveForm] = useState<"artwork" | "testimonial">("artwork");

  return (
    <div>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-6 sm:py-12">
        <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Panel de Administración</h1>
          {/* Selector de formulario */}
          <div className="flex justify-around mb-6">
            <button
              onClick={() => setActiveForm("artwork")}
              className={`py-2 px-4 rounded-md font-medium ${
                activeForm === "artwork"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Subir Cuadro
            </button>
            <button
              onClick={() => setActiveForm("testimonial")}
              className={`py-2 px-4 rounded-md font-medium ${
                activeForm === "testimonial"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Subir Testimonio
            </button>
          </div>
          {/* Formulario activo */}
          {activeForm === "artwork" && <UploadArtwork />}
          {activeForm === "testimonial" && <UploadTestimonial />}
        </div>
      </div>
      <Gallery2 />
      <TestimonialsAdmin/>
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
