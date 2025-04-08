"use client";
import React, { useState, useEffect, useRef } from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import useTheme from "@/hooks/useTheme";
import { ChevronDownIcon, ChevronUpIcon, ShoppingCartIcon, XCircleIcon } from "@heroicons/react/24/outline";
import Prepago from "./prepago";

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
    maxItems?: number;
};

const ArtDetails = ({ art, theme }: { art: Artwork; theme: string }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const textRef = useRef<HTMLParagraphElement | null>(null);

    return (
        <div className="p-4 flex flex-col gap-2">
            <h2 className={`text-lg font-bold line-clamp-1 ${theme === "light" ? "text-foreground" : "text-foreground-dark"}`}>
                {art.title}
            </h2>
            <div className="relative">
                <p
                    ref={textRef}
                    className={`text-sm overflow-hidden transition-all duration-300 ${
                        isExpanded ? 'max-h-[500px]' : 'max-h-[3.6em]'
                    } ${theme === "light" ? "text-foreground" : "text-foreground"}`}
                >
                    {art.description}
                </p>
                {art.description && art.description.length > 200 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsExpanded(!isExpanded);
                        }}
                        className={`text-xs font-medium mt-1 ${
                            theme === "light"
                                ? "text-primary hover:text-primary-dark"
                                : "text-accent hover:text-accent-dark"
                        }`}
                    >
                        {isExpanded ? (
                            <span className="flex items-center">
                                Cerrar <ChevronUpIcon className="w-3 h-3 ml-1" />
                            </span>
                        ) : (
                            <span className="flex items-center">
                                Ver más <ChevronDownIcon className="w-3 h-3 ml-1" />
                            </span>
                        )}
                    </button>
                )}
            </div>
            <div className="mt-2 space-y-1">
                {art.medidas && (
                    <p className="text-xs text-[color:var(--foreground)] dark:text-[color:var(--foreground)]">
                    Medidas: {art.medidas}
                    </p>
                )}
                {art.tecnica && (
                    <p className="text-xs text-[color:var(--foreground)] dark:text-[color:var(--foreground)]">
                    Técnica: {art.tecnica}
                    </p>
                )}
                {art.marco && (
                    <p className="text-xs text-[color:var(--foreground)] dark:text-[color:var(--foreground)]">
                    Marco: {art.marco}
                    </p>
                )}
            </div>
        </div>
    );
};

const Gallery: React.FC<GalleryProps> = ({ showMoreCard = true, maxItems }) => {
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
    const [activeModal, setActiveModal] = useState<null | 'gallery' | 'buy'>(null);
    const theme = useTheme();
    const [displayedArtworks, setDisplayedArtworks] = useState<Artwork[]>([]);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        const fetchArtworks = async () => {
            try {
                const res = await fetch("/api/artworks");
                if (!res.ok) throw new Error("Error fetching artworks");
                const data: Artwork[] = await res.json();
                const sortedArtworks = data.sort((a, b) => a.order - b.order);
                if (isMounted.current) setArtworks(sortedArtworks);
            } catch (error) {
                console.error("Error al obtener las obras de arte:", error);
            }
        };
        fetchArtworks();
        return () => { isMounted.current = false; };
    }, []);

    useEffect(() => {
        setDisplayedArtworks(maxItems ? artworks.slice(0, maxItems) : artworks);
    }, [artworks, maxItems]);

    const openGalleryModal = (art: Artwork) => {
        setSelectedImages([art.mainImageUrl, ...art.subImages.map(img => img.imageUrl)]);
        setActiveModal('gallery');
    };

    const openBuyModal = (art: Artwork) => {
        setSelectedArtwork(art);
        setActiveModal('buy');
    };

    const closeModal = () => {
        setActiveModal(null);
        setSelectedArtwork(null);
    };

    const shouldShowMoreCard = showMoreCard && artworks.length > displayedArtworks.length;

    return (
        <div className={`container p-6 ${theme === "light" ? "bg-background" : "bg-background-dark"}`}>
            <h1 className="text-4xl font-bold text-center mb-8 text-foreground">
                Pide una replica
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {displayedArtworks.map((art) => (
                    <article
                        key={art.id}
                        className="group rounded-lg shadow-lg overflow-hidden transition-transform duration-200 
                                 bg-[var(--card)] border border-[var(--border)] hover:shadow-xl
                                 dark:border-[var(--secondary)]"
                    >
                        <div className="relative aspect-[4/3]">
                            <img
                                src={art.mainImageUrl}
                                alt={art.title}
                                className="w-full object-cover"
                                loading="lazy"
                                onClick={() => openGalleryModal(art)}
                            />
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openBuyModal(art);
                                }}
                                className="absolute top-2 right-2 p-2 rounded-full bg-primary/90 hover:bg-primary transition-colors"
                                aria-label="Comprar obra"
                            >
                                <ShoppingCartIcon className="w-6 h-6 text-white" />
                            </button>
                        </div>
                        <ArtDetails art={art} theme={theme} />
                    </article>
                ))}

                {shouldShowMoreCard && (
                    <article
                        className="group rounded-lg shadow-lg overflow-hidden transition-transform duration-200 
                                 bg-[var(--card)] border border-[var(--border)] hover:shadow-xl
                                 dark:border-[var(--secondary)]"
                    >
                        <a
                            href="/galeria"
                            className="flex flex-col items-center justify-center h-full p-6 text-center"
                        >
                            <div className="flex items-center justify-center h-12 w-12 rounded-full mb-4 
                                       bg-[var(--primary)] text-white dark:bg-[var(--primary)] dark:text-[var(--foreground)]">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-bold mb-2 text-[var(--foreground)]">
                                Ver galería completa
                            </h2>
                            <p className="text-sm text-[var(--primary)] dark:text-[var(--primary)]">
                                Explora más cuadros en nuestra galería
                            </p>
                        </a>
                    </article>
                )}
            </div>

            {activeModal && (
  <div 
    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 mt-16"
    onClick={closeModal} // Cierra al hacer clic fuera
  >
    <div 
      className="relative bg-card rounded-lg shadow-xl max-w-4xl w-full h-[80vh] flex flex-col border border-[var(--border)]"
      onClick={(e) => e.stopPropagation()} // Evita cierre accidental
    >
      <button
        onClick={closeModal}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-danger text-white hover:bg-danger-dark transition-colors"
      >
        <XCircleIcon className="w-6 h-6" />
      </button>
      
      <div className="flex-1 overflow-y-auto"> {/* Contenedor scrollable */}
        {activeModal === 'gallery' ? (
          <Carousel
          showThumbs={false}
          showStatus={false}
          infiniteLoop={true}
          useKeyboardArrows={true}
          dynamicHeight={true}
        >
          {selectedImages.map((imageUrl, index) => (
            <div key={index}>
              <img
                src={imageUrl}
                alt={`Detalle ${index + 1}`}
                className="w-full h-auto max-h-[70vh] object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-artwork.jpg';
                }}
              />
            </div>
          ))}
        </Carousel>
        ) : (
          <Prepago 
            artwork={selectedArtwork} 
            onClose={closeModal}
      
          />
        )}
      </div>
    </div>
  </div>
)}
        </div>
    );
};

export default Gallery;