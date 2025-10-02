"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { StockArtwork } from "@/types/stock-artwork";
import { useCart } from "../../../context/CartContext";
import ReactPaginate from "react-paginate";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
      duration: 0.5,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function StockGrid() {
  const [artworks, setArtworks] = useState<StockArtwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { dispatch } = useCart();
  const [selectedArtwork, setSelectedArtwork] = useState<StockArtwork | null>(
    null
  );
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [pageNumber, setPageNumber] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);

  // Nuevo estado para controlar la paginación responsiva
  // Ajustamos los valores iniciales para ser más restrictivos por defecto si no se detecta la pantalla grande
  const [paginateConfig, setPaginateConfig] = useState({
    marginPagesDisplayed: 0,
    pageRangeDisplayed: 0, // Por defecto, mostrar solo la página actual en números
    showBreakLabel: false, // Nuevo: para controlar si se muestran las elipsis
  });

  useEffect(() => {
    const handleResize = () => {
      // Ajusta itemsPerPage según el tamaño de la pantalla
      if (window.innerWidth < 640) {
        setItemsPerPage(1);
        // Configuración para pantallas muy pequeñas:
        // - No mostrar páginas de margen (0).
        // - No mostrar páginas adyacentes a la actual (0).
        // - Desactivar las elipsis.
        setPaginateConfig({
          marginPagesDisplayed: 0,
          pageRangeDisplayed: 0,
          showBreakLabel: false,
        });
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2);
        // Para tablets:
        // - Mostrar 1 página de margen.
        // - Mostrar 1 página adyacente a la actual.
        // - Habilitar las elipsis si es necesario.
        setPaginateConfig({
          marginPagesDisplayed: 1,
          pageRangeDisplayed: 1,
          showBreakLabel: true,
        });
      } else {
        setItemsPerPage(3);
        // Para desktop:
        // - Mostrar 1 página de margen.
        // - Mostrar 2 páginas adyacentes a la actual.
        // - Habilitar las elipsis.
        setPaginateConfig({
          marginPagesDisplayed: 1,
          pageRangeDisplayed: 2,
          showBreakLabel: true,
        });
      }
      // Resetea la página a 0 cuando cambian los ítems por página
      setPageNumber(0);
    };

    handleResize(); // Ejecutar al montar para establecer el estado inicial
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const pagesVisited = pageNumber * itemsPerPage;
  const displayedArtworks = artworks.slice(
    pagesVisited,
    pagesVisited + itemsPerPage
  );
  const pageCount = Math.ceil(artworks.length / itemsPerPage);

  const changePage = ({ selected }: { selected: number }) =>
    setPageNumber(selected);

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const response = await fetch("/api/stock");
        console.log("STATUS:", response.status); // 🛠️
        const data = await response.json();
        console.log("DATA:", data); // 🛠️
        if (!response.ok)
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        setArtworks(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };
    fetchArtworks();
  }, []);

  const handleAddToCart = (artwork: StockArtwork) => {
    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: artwork.id,
        name: artwork.title,
        price: artwork.price,
        quantity: 1,
        type: "stock_artwork",
      },
    });
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      setSelectedArtwork(null);
    }
  };

  useEffect(() => {
    if (selectedArtwork)
      document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedArtwork]);

  if (loading)
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--primary)]"></div>
        <p className="mt-2 text-[var(--muted2)]">Cargando productos...</p>
      </div>
    );

  if (error)
    return (
      <div className="text-center py-8 text-[var(--primary)]">
        <p>Error al cargar los productos</p>
        <p className="text-sm opacity-75 text-[var(--muted2)]">{error}</p>
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
        <p className="text-[var(--muted2)]">No hay productos disponibles</p>
      </div>
    );

  return (
    <>
      {selectedArtwork && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[var(--background)]/90">
          <div
            ref={modalRef}
            className="relative bg-[var(--card)] rounded-lg overflow-hidden w-11/12 md:w-3/4 lg:w-1/2 border border-[var(--border)]"
          >
            <button
              onClick={() => setSelectedArtwork(null)}
              className="absolute top-2 right-2 z-10 text-[var(--muted2)] hover:text-[var(--foreground)]"
            >
              &#10005;
            </button>
            <Carousel
              showThumbs={false}
              dynamicHeight={false}
              infiniteLoop={true}
              useKeyboardArrows={true}
              className="max-w-full max-h-screen"
            >
              {[
                <div
                  key={`main-${selectedArtwork.id}`}
                  className="flex justify-center items-center h-screen max-h-screen"
                >
                  <img
                    src={selectedArtwork.mainImageUrl}
                    alt={selectedArtwork.title}
                    className="max-w-full max-h-full object-contain bg-[var(--secondary)]"
                    onError={(e) =>
                      ((e.target as HTMLImageElement).src =
                        "/placeholder-artwork.jpg")
                    }
                  />
                </div>,
                ...(selectedArtwork.subImages?.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex justify-center items-center h-screen max-h-screen"
                  >
                    <img
                      src={sub.imageUrl}
                      alt={`${selectedArtwork.title} - subimagen`}
                      className="max-w-full max-h-full object-contain bg-[var(--secondary)]"
                      onError={(e) =>
                        ((e.target as HTMLImageElement).src =
                          "/placeholder-artwork.jpg")
                      }
                    />
                  </div>
                )) ?? []),
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
        {displayedArtworks.map((artwork) => (
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
                onError={(e) =>
                  ((e.target as HTMLImageElement).src = "/placeholder-art.jpg")
                }
              />
              <div className="absolute bottom-2 right-2 bg-[var(--card)]/90 px-3 py-1 rounded-full text-sm font-medium text-[var(--primary)]">
                Original
              </div>
            </div>

            <div className="p-5">
              <h3 className="font-semibold text-lg mb-2 text-[var(--foreground)] truncate">
                {artwork.title}
              </h3>
              <p className="text-[var(--muted2)] text-sm mb-3 line-clamp-2 min-h-[40px]">
                {artwork.description}
              </p>
              <div className="w-full h-px bg-[var(--border)] my-3"></div>
              {/* Información técnica y detalles */}
              <div className="space-y-1 mb-4">
                {artwork.medidas && (
                  <p className="text-[var(--muted2)] text-sm">
                    <span className="font-medium text-[var(--foreground)]">
                      Medidas:
                    </span>{" "}
                    {artwork.medidas}
                  </p>
                )}

                {artwork.tecnica && (
                  <p className="text-[var(--muted2)] text-sm">
                    <span className="font-medium text-[var(--foreground)]">
                      Técnica:
                    </span>{" "}
                    {artwork.tecnica}
                  </p>
                )}

                {artwork.marco && (
                  <p className="text-[var(--muted2)] text-sm">
                    <span className="font-medium text-[var(--foreground)]">
                      Marco:
                    </span>{" "}
                    {artwork.marco}
                  </p>
                )}

                {/* Dimensiones en pixeles como información adicional */}
                <p className="text-[var(--muted2)] text-xs">
                  <span className="font-medium text-[var(--foreground)]">
                    Dimensiones:
                  </span>{" "}
                  {artwork.width}x{artwork.height}px
                </p>
              </div>

              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-lg text-[var(--primary)]">
                  {new Intl.NumberFormat("es-MX", {
                    style: "currency",
                    currency: "MXN",
                  }).format(artwork.price)}
                </span>
                <span
                  className={`text-sm px-2 py-1 rounded ${
                    artwork.stockQuantity > 5
                      ? "bg-[var(--secondary)] text-[var(--primary)]"
                      : artwork.stockQuantity > 0
                      ? "bg-[var(--secondary)] text-[var(--accent)]"
                      : "bg-[var(--secondary)] text-[var(--muted2)]"
                  }`}
                >
                  {artwork.stockQuantity > 0
                    ? `${artwork.stockQuantity} en stock`
                    : "Agotado"}
                </span>
              </div>

              <button
                onClick={() => handleAddToCart(artwork)}
                disabled={artwork.stockQuantity === 0}
                className="w-full py-2 bg-[var(--primary)] text-[var(--white)] rounded-lg font-medium hover:bg-[var(--accent)] transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--primary)]"
              >
                {artwork.stockQuantity > 0 ? "Agregar al carrito" : "Agotado"}
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-6 overflow-x-auto">
        {" "}
        {/* Añadimos overflow-x-auto aquí */}
        <ReactPaginate
          previousLabel={"Anterior"}
          nextLabel={"Siguiente"}
          pageCount={pageCount}
          onPageChange={changePage}
          // Modificado: Ahora el contenedor permite que los elementos se envuelvan si no hay suficiente espacio
          containerClassName={
            "flex justify-center flex-wrap list-none gap-2 min-w-0"
          }
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
          activeLinkClassName={
            "bg-[var(--primary)] text-[var(--white)] hover:bg-[var(--primary)]"
          }
          disabledLinkClassName={
            "opacity-50 cursor-not-allowed hover:bg-transparent text-[var(--muted)]"
          }
          // Props ajustados dinámicamente y el nuevo breakLabel
          marginPagesDisplayed={paginateConfig.marginPagesDisplayed}
          pageRangeDisplayed={paginateConfig.pageRangeDisplayed}
          breakLabel={paginateConfig.showBreakLabel ? "..." : null} // Condicionalmente mostrar elipsis
          breakClassName={"break-me"} // Puedes añadir estilos si lo deseas
          breakLinkClassName={"page-link"}
        />
      </div>
    </>
  );
}
