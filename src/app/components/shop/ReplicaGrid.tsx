'use client';
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useCart } from '../../../context/CartContext';
import ReactPaginate from 'react-paginate';
import { calculateFramePrice } from '@/utils/pricer';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";

// Variantes de animación
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      when: "beforeChildren",
      staggerChildren: 0.1,
      duration: 0.5
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

interface SubImage {
  imageUrl: string;
}

interface Artwork {
  id: number;
  title: string;
  description: string;
  mainImageUrl: string;
  tecnica: string | null;
  marco: string | null;
  subImages: SubImage[];
}

interface Dimensions {
  width: string;
  height: string;
}

export default function ReplicaGrid() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{[key: number]: Dimensions}>({});
  const [prices, setPrices] = useState<{[key: number]: number | null}>({});
  const [calculating, setCalculating] = useState<number | null>(null);
  const { dispatch } = useCart();
  
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [pageNumber, setPageNumber] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerPage(1);
      else if (window.innerWidth < 1024) setItemsPerPage(2);
      else setItemsPerPage(3);
      setPageNumber(0);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const pagesVisited = pageNumber * itemsPerPage;
  const displayedArtworks = artworks.slice(pagesVisited, pagesVisited + itemsPerPage);
  const pageCount = Math.ceil(artworks.length / itemsPerPage);

  const changePage = ({ selected }: { selected: number }) => setPageNumber(selected);

  useEffect(() => {
    const fetchReplicas = async () => {
      try {
        const response = await fetch('/api/artworks');
        if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
        setArtworks(await response.json());
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };
    fetchReplicas();
  }, []);

  useEffect(() => {
    const handlers: { [key: number]: NodeJS.Timeout } = {};
    Object.entries(dimensions).forEach(([artworkId, dim]) => {
      const id = parseInt(artworkId);
      if (dim.width && dim.height) {
        handlers[id] = setTimeout(async () => {
          try {
            setCalculating(id);
            const width = parseInt(dim.width);
            const height = parseInt(dim.height);
            if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
              setPrices(prev => ({ ...prev, [id]: null }));
              return;
            }
            const price = await calculateFramePrice(width, height);
            setPrices(prev => ({ ...prev, [id]: price }));
            setError(null);
          } catch (err) {
            let errorMessage = 'Error desconocido';
            if (err instanceof Error) {
              errorMessage = err.message;
            }
            setError(`Error al calcular el precio: ${errorMessage}`);
            setPrices(prev => ({ ...prev, [id]: null }));
          } finally {
            setCalculating(null);
          }
        }, 500);
      }
    });
    return () => Object.values(handlers).forEach(clearTimeout);
  }, [dimensions]);

  const handleClickOutside = (e: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      setSelectedArtwork(null);
    }
  };

  useEffect(() => {
    if (selectedArtwork) document.addEventListener('mousedown', handleClickOutside);
    else document.removeEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedArtwork]);

  if (loading)
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--primary)]"></div>
        <p className="mt-2 text-[var(--muted2)]">Cargando réplicas...</p>
      </div>
    );

  if (error)
    return (
      <div className="text-center py-8 text-[var(--primary)]">
        <p>Error al cargar las réplicas</p>
        <p className="text-sm opacity-75">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-[var(--primary)] text-[var(--white)] rounded hover:bg-[var(--accent)] transition"
        >
          Reintentar
        </button>
      </div>
    );

  if (artworks.length === 0)
    return (
      <div className="text-center py-8">
        <p className="text-[var(--muted2)]">No hay réplicas disponibles</p>
      </div>
    );

  return (
    <>
      {selectedArtwork && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[var(--background)]/90">
          <div ref={modalRef} className="relative bg-[var(--card)] rounded-lg overflow-hidden w-11/12 md:w-3/4 lg:w-1/2 border border-[var(--border)]">
            <button
              onClick={() => setSelectedArtwork(null)}
              className="absolute top-2 right-2 z-10 text-[var(--muted2)] hover:text-[var(--foreground)]"
            >
              &#10005;
            </button>
            <Carousel 
              showThumbs={false} 
              dynamicHeight={true}
              infiniteLoop={true}
              useKeyboardArrows={true}
            >
              {[
                <div key={`main-${selectedArtwork.id}`}>
                  <img 
                    src={selectedArtwork.mainImageUrl} 
                    alt={selectedArtwork.title} 
                    className="bg-[var(--secondary)]"
                    onError={(e) => (e.target as HTMLImageElement).src = '/placeholder-artwork.jpg'}
                  />
                </div>,
                ...(selectedArtwork.subImages?.map((sub) => (
                  <div key={sub.imageUrl}>
                    <img 
                      src={sub.imageUrl} 
                      alt={`${selectedArtwork.title} - subimagen`} 
                      className="bg-[var(--secondary)]"
                      onError={(e) => (e.target as HTMLImageElement).src = '/placeholder-artwork.jpg'}
                    />
                  </div>
                )) ?? [])
              ]}
            </Carousel>
          </div>
        </div>
      )}

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {displayedArtworks.map((artwork) => {
          const artDimensions = dimensions[artwork.id] || { width: '', height: '' };
          const price = prices[artwork.id];
          
          return (
            <motion.div 
              key={artwork.id} 
              variants={cardVariants}
              className="bg-[var(--card)] rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-[var(--border)]"
            >
              <div 
                className="relative aspect-square bg-[var(--secondary)] cursor-pointer"
                onClick={() => setSelectedArtwork(artwork)}
              >
                <img
                  src={artwork.mainImageUrl}
                  alt={artwork.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => (e.target as HTMLImageElement).src = '/placeholder-art.jpg'}
                />
                <div className="absolute bottom-2 right-2 bg-[var(--card)]/90 px-3 py-1 rounded-full text-sm font-medium text-[var(--primary)]">
                  Réplica
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-lg mb-2 text-[var(--foreground)]">{artwork.title}</h3>
                <p className="text-[var(--muted2)] text-sm mb-4 line-clamp-2 min-h-[40px]">
                  {artwork.description}
                </p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--muted2)]">Ancho (cm)</label>
                    <input
                      type="number"
                      value={artDimensions.width}
                      onChange={(e) => handleDimensionChange(artwork.id, 'width', e.target.value)}
                      className="w-full p-2 border border-[var(--border)] rounded focus:ring-2 focus:ring-[var(--primary)] outline-none bg-[var(--background)]"
                      min="1"
                      placeholder="Ej. 100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--muted2)]">Alto (cm)</label>
                    <input
                      type="number"
                      value={artDimensions.height}
                      onChange={(e) => handleDimensionChange(artwork.id, 'height', e.target.value)}
                      className="w-full p-2 border border-[var(--border)] rounded focus:ring-2 focus:ring-[var(--primary)] outline-none bg-[var(--background)]"
                      min="1"
                      placeholder="Ej. 150"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  {calculating === artwork.id ? (
                    <div className="flex items-center gap-2 text-[var(--primary)]">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[var(--primary)]"></div>
                      <span>Estimando costo...</span>
                    </div>
                  ) : price ? (
                    <div className="text-center bg-[var(--secondary)] p-3 rounded-lg">
                      <span className="text-xl font-bold text-[var(--primary)]">
                        ${price.toLocaleString('es-MX')}
                      </span>
                      <p className="text-sm text-[var(--muted2)] mt-1">Precio final</p>
                    </div>
                  ) : (
                    <div className="text-center text-[var(--muted2)] text-sm">
                      Ingrese las medidas para ver el precio
                    </div>
                  )}
                </div>
                <button
                  className={`w-full py-2 text-[var(--white)] rounded-lg font-medium transition ${
                    price 
                      ? 'bg-[var(--primary)] hover:bg-[var(--accent)]' 
                      : 'bg-[var(--muted)] cursor-not-allowed'
                  }`}
                  onClick={() => handleAddToCart(artwork)}
                  disabled={!price}
                >
                  Añadir al carrito
                </button>
                <div className="mt-4 grid grid-cols-2 gap-2 text-center text-sm">
                  <div className="bg-[var(--secondary)] p-2 rounded">
                    <div className="font-medium text-[var(--primary)]">Técnica</div>
                    <div className="text-[var(--muted2)]">{artwork.tecnica || 'N/A'}</div>
                  </div>
                  <div className="bg-[var(--secondary)] p-2 rounded">
                    <div className="font-medium text-[var(--primary)]">Marco</div>
                    <div className="text-[var(--muted2)]">{artwork.marco || 'No incluido'}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="mt-6">
        <ReactPaginate
          previousLabel={"Anterior"}
          nextLabel={"Siguiente"}
          pageCount={pageCount}
          onPageChange={changePage}
          containerClassName={"flex justify-center list-none gap-2"}
          pageClassName={"inline-block"}
          pageLinkClassName={
            "px-3 py-1 border border-[var(--border)] rounded hover:bg-[var(--secondary)] transition-colors text-[var(--muted2)]"
          }
          previousLinkClassName={
            "px-3 py-1 border border-[var(--border)] rounded hover:bg-[var(--secondary)] transition-colors text-[var(--muted2)]"
          }
          nextLinkClassName={
            "px-3 py-1 border border-[var(--border)] rounded hover:bg-[var(--secondary)] transition-colors text-[var(--muted2)]"
          }
          activeLinkClassName={"bg-[var(--primary)] text-[var(--white)] hover:bg-[var(--primary)]"}
          disabledLinkClassName={"opacity-50 cursor-not-allowed hover:bg-transparent text-[var(--muted)]"}
          marginPagesDisplayed={1}
          pageRangeDisplayed={2}
        />
      </div>
    </>
  );

  function handleDimensionChange(artworkId: number, field: 'width' | 'height', value: string) {
    setDimensions(prev => ({
      ...prev,
      [artworkId]: {
        ...(prev[artworkId] || { width: '', height: '' }),
        [field]: value.replace(/[^0-9]/g, '')
      }
    }));
  }

  function handleAddToCart(artwork: Artwork) {
    const price = prices[artwork.id];
    if (!price) {
      setError('Primero ingresa dimensiones válidas');
      return;
    }
    const currentDimensions = dimensions[artwork.id];
    if (!currentDimensions?.width || !currentDimensions?.height) {
      setError('Dimensiones requeridas');
      return;
    }
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: artwork.id,
        name: artwork.title,
        price: price,
        quantity: 1, 
        metadata: {
          width: currentDimensions.width,
          height: currentDimensions.height
        }
      },
    });
  }
}