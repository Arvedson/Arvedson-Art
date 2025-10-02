"use client";
import React, { useState, useEffect, useRef } from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import useTheme from "@/hooks/useTheme";

type Artwork = {
  id: number;
  title: string;
  description: string;
  mainImageUrl: string;
  width: number;
  height: number;
  order: number;
  subImages: { imageUrl: string }[];
  medidas?: string | null;
  tecnica?: string | null;
  marco?: string | null;
};

export default function Gallery2() {
  const [artworksWithOrder, setArtworksWithOrder] = useState<Artwork[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<number | null>(null);
  const inputRefs = useRef<Map<number, HTMLInputElement>>(new Map());
  const theme = useTheme();

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const res = await fetch("/api/artworks");
        if (!res.ok) throw new Error("Error fetching artworks");
        const data: Artwork[] = await res.json();
        setArtworksWithOrder(data.sort((a, b) => a.order - b.order));
      } catch (error) {
        console.error("Error al obtener las obras de arte:", error);
      }
    };
    fetchArtworks();
  }, []);

  const handleArtworkClick = (
    mainImageUrl: string,
    subImages: { imageUrl: string }[]
  ) => {
    setSelectedImages([mainImageUrl, ...subImages.map((img) => img.imageUrl)]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleOrderChange = (id: number, newOrder: number) => {
    setArtworksWithOrder((prevArtworks) =>
      prevArtworks.map((artwork) =>
        artwork.id === id ? { ...artwork, order: newOrder } : artwork
      )
    );
  };

  const handleSaveOrder = async (id: number) => {
    try {
      const artworkToUpdate = artworksWithOrder.find((a) => a.id === id);
      if (!artworkToUpdate) return;

      const response = await fetch("/api/artworks", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          artworks: [{ id: id, order: artworkToUpdate.order }],
        }),
      });

      if (response.ok) {
        setIsModalOpen(false);
        setEditingOrder(null);
        alert("Orden actualizado");

        // Actualizar la lista completa después de guardar
        const res = await fetch("/api/artworks");
        if (res.ok) {
          const data: Artwork[] = await res.json();
          setArtworksWithOrder(data.sort((a, b) => a.order - b.order));
        }
      } else {
        alert("Error al actualizar el orden");
      }
    } catch (error) {
      console.error("Error al guardar el orden:", error);
      alert("Error al guardar el orden");
    }
  };

  const handleEditClick = (id: number) => {
    setEditingOrder(id);
  };

  const handleInputChange = (id: number, value: number) => {
    handleOrderChange(id, value);
  };

  const handleDeleteArtwork = async (id: number) => {
    try {
      const confirmed = confirm(
        "¿Estás seguro de que deseas eliminar este cuadro?"
      );
      if (!confirmed) return;

      const response = await fetch(`/api/artworks?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Cuadro eliminado exitosamente");
        // Actualizar la lista de obras de arte
        const res = await fetch("/api/artworks");
        if (res.ok) {
          const data: Artwork[] = await res.json();
          setArtworksWithOrder(data.sort((a, b) => a.order - b.order));
        }
      } else {
        alert("Error al eliminar el cuadro");
      }
    } catch (error) {
      console.error("Error al eliminar el cuadro:", error);
      alert("Error al eliminar el cuadro");
    }
  };

  return (
    <div className="container p-6">
      {/* Grid de obras de arte */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {artworksWithOrder.map((art) => (
          <div
            key={art.id}
            className={`artwork-item rounded-lg shadow-lg border relative ${
              theme === "dark"
                ? "bg-[var(--card)] border-[var(--border)]"
                : "bg-[var(--card)] border-[var(--border)]"
            }`}
          >
            <div
              className="relative w-full aspect-w-4 aspect-h-3 cursor-pointer"
              onClick={() =>
                handleArtworkClick(art.mainImageUrl, art.subImages)
              }
            >
              <img
                src={art.mainImageUrl}
                alt={art.title}
                className="w-full h-full object-cover rounded-t-lg"
              />
            </div>
            <div className="p-4">
              <h2
                className={`text-lg font-bold truncate ${
                  theme === "dark"
                    ? "text-[var(--foreground)]"
                    : "text-[var(--foreground)]"
                }`}
              >
                {art.title}
              </h2>
              <p
                className={`text-sm truncate ${
                  theme === "dark"
                    ? "text-[var(--muted2)]"
                    : "text-[var(--muted2)]"
                }`}
              >
                {art.description}
              </p>
              {art.medidas && (
                <p
                  className={`text-xs ${
                    theme === "dark"
                      ? "text-[var(--muted2)]"
                      : "text-[var(--muted2)]"
                  }`}
                >
                  Medidas: {art.medidas}
                </p>
              )}
              {art.tecnica && (
                <p
                  className={`text-xs ${
                    theme === "dark"
                      ? "text-[var(--muted2)]"
                      : "text-[var(--muted2)]"
                  }`}
                >
                  Técnica: {art.tecnica}
                </p>
              )}
              {art.marco && (
                <p
                  className={`text-xs ${
                    theme === "dark"
                      ? "text-[var(--muted2)]"
                      : "text-[var(--muted2)]"
                  }`}
                >
                  Marco: {art.marco}
                </p>
              )}
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs ${
                      theme === "dark"
                        ? "text-[var(--muted2)]"
                        : "text-[var(--muted2)]"
                    }`}
                  >
                    Orden:
                  </span>
                  {editingOrder === art.id ? (
                    <>
                      <input
                        type="number"
                        value={art.order}
                        onChange={(e) => {
                          const newOrder = parseInt(e.target.value, 10);
                          if (!isNaN(newOrder)) {
                            handleInputChange(art.id, newOrder);
                          }
                        }}
                        className={`w-16 h-8 text-sm border rounded-md px-2 ${
                          theme === "dark"
                            ? "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]"
                            : "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]"
                        }`}
                        ref={(el) => {
                          if (el) {
                            inputRefs.current.set(art.id, el);
                          }
                        }}
                        onClick={(e) => {
                          e.currentTarget.select();
                        }}
                      />
                      <button
                        onClick={() => handleSaveOrder(art.id)}
                        className="bg-[var(--primary)] hover:bg-[var(--accent)] text-[var(--text-on-primary)] font-bold py-1 px-2 rounded text-xs transition-colors"
                      >
                        Guardar
                      </button>
                    </>
                  ) : (
                    <span
                      className={`text-sm ${
                        theme === "dark"
                          ? "text-[var(--foreground)]"
                          : "text-[var(--foreground)]"
                      }`}
                    >
                      {art.order}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(art.id);
                        }}
                        className={`ml-2 font-bold py-1 px-2 rounded text-xs transition-colors ${
                          theme === "dark"
                            ? "bg-[var(--secondary)] hover:bg-[var(--muted)] text-[var(--foreground)]"
                            : "bg-[var(--secondary)] hover:bg-[var(--muted)] text-[var(--foreground)]"
                        }`}
                      >
                        Editar
                      </button>
                    </span>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteArtwork(art.id);
                  }}
                  className="bg-[var(--negative)] hover:bg-red-600 text-white font-bold py-1 px-2 rounded text-xs transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className={`rounded-lg shadow-lg w-full max-w-4xl relative overflow-hidden ${
              theme === "dark"
                ? "bg-[var(--card)] text-[var(--foreground)]"
                : "bg-[var(--card)] text-[var(--foreground)]"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <Carousel
              showThumbs={false}
              infiniteLoop
              interval={3000}
              swipeable
              emulateTouch
              className="mt-8"
            >
              {selectedImages.map((url, index) => {
                return (
                  <div key={index}>
                    <div className="relative w-full h-[60vh]">
                      <img
                        src={url}
                        alt={`Imagen ${index}`}
                        className="w-full h-full object-contain rounded-lg"
                      />
                    </div>
                  </div>
                );
              })}
            </Carousel>
          </div>
        </div>
      )}
    </div>
  );
}
