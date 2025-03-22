"use client";
import { useState } from "react";

interface FormValues {
  title: string;
  description: string;
  order: string;
  medidas: string;
  tecnica: string;
  marco: string;
}

export default function UploadArtwork() {
  const [formData, setFormData] = useState<FormValues>({
    title: "",
    description: "",
    order: "",
    medidas: "",
    tecnica: "",
    marco: "",
  });
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [subImages, setSubImages] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setMainImage(e.target.files[0]);
    }
  };

  const handleSubImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setSubImages(selectedFiles);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!formData.title || !formData.description || !formData.order || !mainImage) {
      setError("Todos los campos son obligatorios y debe seleccionar una imagen principal.");
      setIsSubmitting(false);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("order", formData.order);
    formDataToSend.append("medidas", formData.medidas);
    formDataToSend.append("tecnica", formData.tecnica);
    formDataToSend.append("marco", formData.marco);

    formDataToSend.append("images", mainImage);

    subImages.forEach((file) => formDataToSend.append("images", file));

    try {
      const response = await fetch("/api/artworks", {
        method: "POST",
        body: formDataToSend,
      });

      if (response.ok) {
        alert("Cuadro subido exitosamente");
        setFormData({
          title: "",
          description: "",
          order: "",
          medidas: "",
          tecnica: "",
          marco: "",
        });
        setMainImage(null);
        setSubImages([]);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Error al subir el cuadro");
        console.error("Error from server:", errorData);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message || "Error al subir el cuadro");
        console.error("Error:", error.message);
      } else {
        setError("Error desconocido al subir el cuadro");
        console.error("Error desconocido:", error);
      }
    }
    
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Título
        </label>
        <input
          type="text"
          name="title"
          id="title"
          placeholder="Título del cuadro"
          value={formData.title}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Descripción
        </label>
        <textarea
          name="description"
          id="description"
          placeholder="Describe el cuadro"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>
      <div>
        <label htmlFor="medidas" className="block text-sm font-medium text-gray-700">
          Medidas
        </label>
        <input
          type="text"
          name="medidas"
          id="medidas"
          placeholder="Ej: 120*300"
          value={formData.medidas}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>
      <div>
        <label htmlFor="tecnica" className="block text-sm font-medium text-gray-700">
          Técnica
        </label>
        <input
          type="text"
          name="tecnica"
          id="tecnica"
          placeholder="Ej: Óleo sobre lienzo"
          value={formData.tecnica}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>
      <div>
        <label htmlFor="marco" className="block text-sm font-medium text-gray-700">
          Marco
        </label>
        <input
          type="text"
          name="marco"
          id="marco"
          placeholder="Ej: Con marco de madera"
          value={formData.marco}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>
      <div>
        <label htmlFor="order" className="block text-sm font-medium text-gray-700">
          Orden
        </label>
        <input
          type="number"
          name="order"
          id="order"
          placeholder="No de cuadro mostrado"
          value={formData.order}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>
      <div>
        <label htmlFor="mainImage" className="block text-sm font-medium text-gray-700">
          Imagen Principal
        </label>
        <input
          type="file"
          name="mainImage"
          id="mainImage"
          onChange={handleMainImageChange}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          required
        />
        {mainImage && (
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              Archivo seleccionado: {mainImage.name}
            </p>
          </div>
        )}
      </div>
      <div>
        <label htmlFor="subImages" className="block text-sm font-medium text-gray-700">
          Subimágenes
        </label>
        <input
          type="file"
          name="subImages"
          id="subImages"
          multiple
          onChange={handleSubImagesChange}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          required
        />
        {subImages.length > 0 && (
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              Archivos seleccionados: {subImages.map((file) => file.name).join(", ")}
            </p>
          </div>
        )}
      </div>
      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Subiendo..." : "Subir Cuadro"}
      </button>
    </form>
  );
}

