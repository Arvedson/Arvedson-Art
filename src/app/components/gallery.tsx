"use client";
import React, { useState, useEffect, useRef } from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import useTheme from "@/hooks/useTheme";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

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

type GalleryProps = {
  showMoreCard?: boolean;
};

const ArtDetails = ({ art, theme }: { art: Artwork; theme: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [descriptionHeight, setDescriptionHeight] = useState<string>('0px'); // Cambiado el tipo a string
  const textRef = useRef<HTMLParagraphElement>(null);

  const toggleExpanded = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    if (textRef.current) {
      setDescriptionHeight(isExpanded ? `${textRef.current.scrollHeight}px` : '0px');
    }
  }, [isExpanded]);

  return (
    <div className="p-4">
      <h2
        className={`text-lg font-bold truncate ${
          theme === "light"
            ? "text-[var(--foreground)]"
            : "text-[var(--foreground)]"
        }`}
      >
        {art.title}
      </h2>
      <p
        ref={textRef}
        className={`text-sm overflow-hidden transition-all duration-300 ${
          theme === "light"
            ? "text-[var(--foreground)]"
            : "text-[var(--foreground)]"
        }`}
        style={{ maxHeight: descriptionHeight }}
      >
        {art.description}
      </p>
      {art.description && art.description.length > 200 && (
        <button
          onClick={toggleExpanded}
          className={`flex items-center mt-2 text-xs font-medium transition-colors duration-200 mb-2 ${
            theme === "light"
              ? "text-black-500 hover:text-black-700"
              : "text-blue-800 hover:text-blue-800"
          } py-1 px-2`}
        >
          {isExpanded ? "Cerrar" : "Descripcion"}
          {isExpanded ? (
            <ChevronUpIcon className="w-3 h-3 ml-1" />
          ) : (
            <ChevronDownIcon className="w-3 h-3 ml-1" />
          )}
        </button>
      )}
      {art.medidas && (
        <p className={`pt-1 text-xs ${theme === "light" ? "text-gray-250" : "text-gray-400"}`}>
          • Medidas: {art.medidas}
        </p>
      )}
      {art.tecnica && (
        <p className={`pt-1 text-xs ${theme === "light" ? "text-gray-250" : "text-gray-400"}`}>
          • Técnica: {art.tecnica}
        </p>
      )}
      {art.marco && (
        <p className={`pt-1 text-xs ${theme === "light" ? "text-gray-250" : "text-gray-400"}`}>
          • Marco: {art.marco}
        </p>
      )}
    </div>
  );
};

const Gallery: React.FC<GalleryProps> = ({ showMoreCard = true }) => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const res = await fetch("/api/artworks");
        if (!res.ok) throw new Error("Error fetching artworks");
        const data: Artwork[] = await res.json();
        setArtworks(data.sort((a, b) => a.order - b.order));
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

  return (
    <div
      className={`container p-6 transition-colors duration-300  ${
        theme === "light"
          ? "bg-[var(--background)] text-[var(--foreground)]"
          : "bg-gray-900 text-gray-100"
      }`}
    >
      <h1
        className={`text-4xl font-bold text-center mb-8 fade-in ${
          theme === "light"
            ? "text-[var(--foreground)]"
            : "text-[var(--foreground)]"
        }`}
      >
        Galería de Cuadros
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {artworks.map((art) => (
          <div
            key={art.id}
            className={`group rounded-lg shadow-lg transition-shadow border fade-in cursor-pointer ${
              theme === "light"
                ? "bg-[var(--muted)] border-[var(--border)] hover:shadow-xl hover:scale-[1.03]"
                : "bg-[var(--secondary)] border-[var(--border)] hover:shadow-xl hover:scale-[1.03]"
            }`}
            onClick={() => handleArtworkClick(art.mainImageUrl, art.subImages)}
          >
            <div className="relative w-full aspect-w-4 aspect-h-3">
              <img
                src={art.mainImageUrl}
                alt={art.title}
                className="w-full h-full object-cover rounded-t-lg"
                loading="lazy" 
              />
            </div>
            <ArtDetails art={art} theme={theme} />
          </div>
        ))}

        {showMoreCard && (
          <div
            onClick={() => (window.location.href = "/galeria")}
            className={`group rounded-lg shadow-lg hover:shadow-xl transition-shadow border fade-in cursor-pointer flex flex-col items-center justify-center ${
              theme === "light"
                ? "bg-[var(--muted)] border-[var(--border)]"
                : "bg-[var(--secondary)] border-[var(--border)]"
            }`}
          >
            <div className="text-center p-6 flex flex-col items-center space-y-4">
              <div
                className={`flex items-center justify-center h-12 w-12 rounded-full transition-transform duration-200 transform group-hover:scale-110 ${
                  theme === "light"
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--primary)] text-black"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <h2
                className={`text-lg font-bold ${
                  theme === "light"
                    ? "text-[var(--foreground)]"
                    : "text-[var(--foreground)]"
                }`}
              >
                Ver galería completa...
              </h2>
              <p
                className={`text-sm ${
                  theme === "light"
                    ? "text-[var(--primary)]"
                    : "text-[var(--primary)]"
                }`}
              >
                Explora más cuadros en nuestra galería.
              </p>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className={`bg-[var(--background)] text-[var(--foreground)] rounded-lg shadow-lg w-full max-w-4xl relative overflow-hidden`}
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
              autoPlay
              interval={3000}
              swipeable
              emulateTouch
              className="mt-8"
            >
              {selectedImages.map((url, index) => (
                <div key={index}>
                  <div className="relative w-full h-[60vh]">
                    <img
                      src={url}
                      alt={`Imagen ${index}`}
                      className="w-full h-full object-contain rounded-lg"
                      loading="lazy" 
                    />
                  </div>
                </div>
              ))}
            </Carousel>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
