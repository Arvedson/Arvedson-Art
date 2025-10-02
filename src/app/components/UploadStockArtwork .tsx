"use client";
import { useState } from "react";
import useTheme from "@/hooks/useTheme";

interface FormValues {
  title: string;
  description: string;
  order: string;
  price: string;
  stockQuantity: string;
  medidas: string;
  tecnica: string;
  marco: string;
}

export default function UploadStockArtwork() {
  const [formData, setFormData] = useState<FormValues>({
    title: "",
    description: "",
    order: "",
    price: "",
    stockQuantity: "",
    medidas: "",
    tecnica: "",
    marco: "",
  });
  const [images, setImages] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const theme = useTheme();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setImages(selectedFiles);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (
      !formData.title ||
      !formData.description ||
      !formData.order ||
      !formData.price ||
      !formData.stockQuantity ||
      images.length === 0
    ) {
      setError(
        "Todos los campos son obligatorios y debe seleccionar al menos una imagen."
      );
      setIsSubmitting(false);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("order", formData.order);
    formDataToSend.append("price", formData.price);
    formDataToSend.append("stockQuantity", formData.stockQuantity);
    formDataToSend.append("medidas", formData.medidas);
    formDataToSend.append("tecnica", formData.tecnica);
    formDataToSend.append("marco", formData.marco);

    images.forEach((file) => formDataToSend.append("images", file));

    try {
      const response = await fetch("/api/stock", {
        method: "POST",
        body: formDataToSend,
      });

      if (response.ok) {
        alert("Cuadro en stock subido exitosamente");
        setFormData({
          title: "",
          description: "",
          order: "",
          price: "",
          stockQuantity: "",
          medidas: "",
          tecnica: "",
          marco: "",
        });
        setImages([]);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Error al subir el cuadro en stock");
        console.error("Error from server:", errorData);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message || "Error al subir el cuadro en stock");
        console.error("Error:", error.message);
      } else {
        setError("Error desconocido al subir el cuadro en stock");
        console.error("Error desconocido:", error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div
          className={`border px-4 py-3 rounded relative ${
            theme === "dark"
              ? "bg-[var(--negative)]/20 border-[var(--negative)] text-[var(--negative)]"
              : "bg-red-100 border-red-400 text-red-700"
          }`}
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div>
        <label
          htmlFor="title"
          className={`block text-sm font-medium ${
            theme === "dark"
              ? "text-[var(--foreground)]"
              : "text-[var(--foreground)]"
          }`}
        >
          Título
        </label>
        <input
          type="text"
          name="title"
          id="title"
          placeholder="Título del cuadro"
          value={formData.title}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] placeholder-[var(--muted2)] focus:border-[var(--primary)] focus:ring-[var(--primary)]`}
          required
        />
      </div>
      <div>
        <label
          htmlFor="description"
          className={`block text-sm font-medium ${
            theme === "dark"
              ? "text-[var(--foreground)]"
              : "text-[var(--foreground)]"
          }`}
        >
          Descripción
        </label>
        <textarea
          name="description"
          id="description"
          placeholder="Describe el cuadro"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] placeholder-[var(--muted2)] focus:border-[var(--primary)] focus:ring-[var(--primary)]`}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="price"
            className={`block text-sm font-medium ${
              theme === "dark"
                ? "text-[var(--foreground)]"
                : "text-[var(--foreground)]"
            }`}
          >
            Precio ($)
          </label>
          <input
            type="number"
            name="price"
            id="price"
            placeholder="Precio en dólares"
            value={formData.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] placeholder-[var(--muted2)] focus:border-[var(--primary)] focus:ring-[var(--primary)]`}
            required
          />
        </div>
        <div>
          <label
            htmlFor="stockQuantity"
            className={`block text-sm font-medium ${
              theme === "dark"
                ? "text-[var(--foreground)]"
                : "text-[var(--foreground)]"
            }`}
          >
            Cantidad en Stock
          </label>
          <input
            type="number"
            name="stockQuantity"
            id="stockQuantity"
            placeholder="Cantidad disponible"
            value={formData.stockQuantity}
            onChange={handleChange}
            min="0"
            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] placeholder-[var(--muted2)] focus:border-[var(--primary)] focus:ring-[var(--primary)]`}
            required
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="medidas"
          className={`block text-sm font-medium ${
            theme === "dark"
              ? "text-[var(--foreground)]"
              : "text-[var(--foreground)]"
          }`}
        >
          Medidas
        </label>
        <input
          type="text"
          name="medidas"
          id="medidas"
          placeholder="Ej: 120*300"
          value={formData.medidas}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] placeholder-[var(--muted2)] focus:border-[var(--primary)] focus:ring-[var(--primary)]`}
        />
      </div>
      <div>
        <label
          htmlFor="tecnica"
          className={`block text-sm font-medium ${
            theme === "dark"
              ? "text-[var(--foreground)]"
              : "text-[var(--foreground)]"
          }`}
        >
          Técnica
        </label>
        <input
          type="text"
          name="tecnica"
          id="tecnica"
          placeholder="Ej: Óleo sobre lienzo"
          value={formData.tecnica}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] placeholder-[var(--muted2)] focus:border-[var(--primary)] focus:ring-[var(--primary)]`}
        />
      </div>
      <div>
        <label
          htmlFor="marco"
          className={`block text-sm font-medium ${
            theme === "dark"
              ? "text-[var(--foreground)]"
              : "text-[var(--foreground)]"
          }`}
        >
          Marco
        </label>
        <input
          type="text"
          name="marco"
          id="marco"
          placeholder="Ej: Con marco de madera"
          value={formData.marco}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] placeholder-[var(--muted2)] focus:border-[var(--primary)] focus:ring-[var(--primary)]`}
        />
      </div>
      <div>
        <label
          htmlFor="order"
          className={`block text-sm font-medium ${
            theme === "dark"
              ? "text-[var(--foreground)]"
              : "text-[var(--foreground)]"
          }`}
        >
          Orden
        </label>
        <input
          type="number"
          name="order"
          id="order"
          placeholder="Posición en la galería"
          value={formData.order}
          onChange={handleChange}
          min="0"
          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] placeholder-[var(--muted2)] focus:border-[var(--primary)] focus:ring-[var(--primary)]`}
          required
        />
      </div>
      <div>
        <label
          htmlFor="images"
          className={`block text-sm font-medium ${
            theme === "dark"
              ? "text-[var(--foreground)]"
              : "text-[var(--foreground)]"
          }`}
        >
          Imágenes (la primera será la principal)
        </label>
        <input
          type="file"
          name="images"
          id="images"
          multiple
          onChange={handleImagesChange}
          className={`mt-1 block w-full text-sm text-[var(--muted2)] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--primary)]/10 file:text-[var(--primary)] hover:file:bg-[var(--primary)]/20`}
          required
        />
        {images.length > 0 && (
          <div className="mt-2">
            <p
              className={`text-sm ${
                theme === "dark"
                  ? "text-[var(--muted2)]"
                  : "text-[var(--muted2)]"
              }`}
            >
              Archivos seleccionados:{" "}
              {images.map((file) => file.name).join(", ")}
            </p>
          </div>
        )}
      </div>
      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-[var(--text-on-primary)] bg-[var(--primary)] hover:bg-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-colors"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Subiendo..." : "Subir Cuadro en Stock"}
      </button>
    </form>
  );
}
