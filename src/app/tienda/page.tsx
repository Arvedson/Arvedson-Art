"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPaintBrush,
  FaPalette,
  FaMagic,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { FiCheckCircle, FiX } from "react-icons/fi";
import { ShoppingCart } from "lucide-react";
import StockGrid from "../components/shop/StockGrid";
import ReplicaGrid from "../components/shop/ReplicaGrid";
import CuadroPersonalizado from "../components/shop/CuadroPersonalizado";
import CarritoCompra from "../components/cart/Carrito";
import AddressSection from "../components/AddressSection";
import { useCart } from "../../context/CartContext";
import { Address } from "../../types/cart";
import FadeSeparator from "../components/stylecomponents/FadeSeparator";

const TiendaPage = () => {
  const [selectedTab, setSelectedTab] = useState<
    "originales" | "replicas" | "personalizado"
  >("originales");
  const [mostrarDireccion, setMostrarDireccion] = useState(false);
  const [direccionTemporal, setDireccionTemporal] = useState<Address | null>(
    null
  );
  const heroRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  // ESTADOS PARA EL MODAL DEL CARRITO
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  const { state, dispatch } = useCart();
  const { items } = state;

  useEffect(() => {
    const handleScroll = () => setScrollPosition(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // useEffect para detectar el tamaño de la pantalla - MODIFICADO para que 775+ sea "pantalla grande"
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 775); // Cambié de 768 a 775
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Descripciones dinámicas para cada tipo de contenido
  const getDescription = (tab: "originales" | "replicas" | "personalizado") => {
    switch (tab) {
      case "originales":
        return "Explora nuestra colección de obras originales únicas, cada una con su propia historia y técnica artística distintiva";
      case "replicas":
        return "Réplicas de alta calidad de obras maestras famosas, perfectas para decorar tu hogar con arte clásico";
      case "personalizado":
        return "Crea tu propia obra de arte personalizada, desde el diseño hasta el acabado, completamente a tu medida";
      default:
        return "Descubre obras maestras únicas, réplicas personalizadas y crea tu propia obra";
    }
  };

  const HeroSection = () => {
    const parallaxY = scrollPosition * 0.2;

    return (
      <div
        ref={heroRef}
        className="relative h-96 mb-2 overflow-hidden"
        style={{
          backgroundImage: "url(/hero1.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className={`absolute inset-0 bg-gradient-to-r from-[var(--primaryblue)] to-[var(--primary)] opacity-80`}
        />

        <div className="container mx-auto px-4 h-full flex items-center relative z-10">
          <div className="text-[var(--white)]">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 md:mb-6">
              Tienda de Arte
            </h1>
            <AnimatePresence mode="wait">
              <motion.p
                key={selectedTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-lg md:text-xl mb-6 md:mb-8"
              >
                {getDescription(selectedTab)}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        <motion.div
          style={{ y: parallaxY }}
          className="absolute inset-0 bg-cover bg-center pointer-events-none"
        />
      </div>
    );
  };

  const handleGuardarDireccion = () => {
    if (direccionTemporal)
      dispatch({ type: "UPDATE_ADDRESS", payload: direccionTemporal });
    setMostrarDireccion(false);
    setDireccionTemporal(null);
  };

  const toggleDireccion = () => {
    setMostrarDireccion(!mostrarDireccion);
    if (!mostrarDireccion) setDireccionTemporal(null);
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <HeroSection />
      <FadeSeparator
        topColor="transparent"
        bottomColor={{
          light: "var(--background)",
          dark: "var(--background)",
        }}
        height={50}
      />

      <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6 md:gap-8">
        {/* Contenido Principal */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 md:mb-8 gap-3">
            <div className="flex flex-wrap gap-2">
              {(["originales", "replicas", "personalizado"] as const).map(
                (tab) => (
                  <motion.button
                    key={tab}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center px-4 py-2.5 md:px-5 md:py-3 rounded-lg text-sm md:text-base ${
                      selectedTab === tab
                        ? `text-white shadow-lg ${
                            tab === "originales"
                              ? "bg-blue-600"
                              : tab === "replicas"
                              ? "bg-purple-600"
                              : "bg-pink-600"
                          }`
                        : "bg-[var(--card)] text-[var(--muted2)] shadow-sm hover:shadow-md border border-[var(--border)]"
                    }`}
                    onClick={() => setSelectedTab(tab)}
                  >
                    {tab === "originales" && <FaPaintBrush className="mr-2" />}
                    {tab === "replicas" && <FaPalette className="mr-2" />}
                    {tab === "personalizado" && <FaMagic className="mr-2" />}
                    {tab === "originales"
                      ? "Obras Disponibles"
                      : tab === "replicas"
                      ? "Réplicas"
                      : "Personalizado"}
                  </motion.button>
                )
              )}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {selectedTab === "originales" ? (
                <section>
                  <h2 className="text-2xl md:text-3xl font-bold mb-6 text-[var(--foreground)] flex items-center">
                    <FaPaintBrush className="mr-3 text-blue-600" />
                    Obras Disponibles
                  </h2>
                  <StockGrid />
                </section>
              ) : selectedTab === "replicas" ? (
                <section>
                  <h2 className="text-2xl md:text-3xl font-bold mb-6 text-[var(--foreground)] flex items-center">
                    <FaPalette className="mr-3 text-purple-600" />
                    Réplicas Personalizadas
                  </h2>
                  <ReplicaGrid />
                </section>
              ) : (
                <section>
                  <h2 className="text-2xl md:text-3xl font-bold mb-6 text-[var(--foreground)] flex items-center">
                    <FaMagic className="mr-3 text-pink-600" />
                    Crea Tu Obra Personalizada
                  </h2>
                  <div className="bg-[var(--card)] p-4 md:p-6 rounded-xl shadow-sm border border-[var(--border)]">
                    <CuadroPersonalizado />
                  </div>
                </section>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Sección Lateral - MOVIDA DENTRO DEL CONTENEDOR */}
        {!isSmallScreen && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-72 xl:w-80 flex flex-col gap-4"
          >
            <div
              className={`bg-[var(--card)] p-4 md:p-5 rounded-xl shadow-sm flex flex-col  gap-3 border border-[var(--border)]`}
            >
              <div className="flex flex-col gap-3">
                <h3 className="text-lg font-semibold text-[var(--foreground)]">
                  ¿Necesitas ayuda?
                </h3>
                <p className="text-sm text-[var(--muted2)] leading-relaxed">
                  Nuestros expertos en arte están disponibles para asesorarte
                </p>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full bg-[var(--secondary)] text-[var(--primary)] py-2 rounded-lg flex items-center justify-center gap-2
                                        transition-colors hover:bg-[var(--accent)] hover:text-[var(--white)]`}
                >
                  <FiCheckCircle className="text-lg" />
                  Contactar Asesor
                </motion.button>

                {/* CONDICIONAL: Carrito fijo en pantallas grandes (775+), o NADA en pequeñas (el botón flotante lo abre) */}
                {!isSmallScreen && <CarritoCompra />}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full bg-[var(--secondary)] text-[var(--primary)] py-2 rounded-lg flex items-center justify-center gap-2
                                        hover:bg-[var(--accent)] hover:text-[var(--white)]`}
                  onClick={toggleDireccion}
                >
                  <FaMapMarkerAlt className="text-lg" />
                  {state.address
                    ? "Cambiar Dirección de Envio"
                    : "Añadir Dirección de Envio"}
                </motion.button>
              </div>

              <AnimatePresence>
                {mostrarDireccion && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-[var(--border)] pt-4 mt-4">
                      <AddressSection onAddressSelect={setDireccionTemporal} />

                      <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex gap-2 mt-4"
                      >
                        <button
                          onClick={handleGuardarDireccion}
                          className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all ${
                            direccionTemporal
                              ? "bg-[var(--primary)] text-[var(--white)] hover:bg-[var(--accent)]"
                              : "bg-[var(--secondary)] text-[var(--muted)] cursor-not-allowed"
                          }`}
                          disabled={!direccionTemporal}
                        >
                          <FiCheckCircle className="text-lg" />
                          Guardar
                        </button>
                        <button
                          onClick={() => setMostrarDireccion(false)}
                          className="flex-1 py-2 px-4 bg-[var(--secondary)] text-[var(--muted2)] rounded-lg hover:bg-[var(--border)] transition-colors flex items-center justify-center gap-2"
                        >
                          <FiX className="text-lg" />
                          Cancelar
                        </button>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* BOTÓN FLOTANTE: Solo para pantallas pequeñas (<775px) y cuando el modal no está abierto */}
        {isSmallScreen && !isCartModalOpen && (
          <button
            onClick={() => setIsCartModalOpen(true)}
            className="fixed bottom-4 right-4 bg-[var(--primary)] text-white p-4 rounded-full shadow-lg z-[999] flex items-center justify-center"
            aria-label="Open cart"
          >
            <ShoppingCart className="w-6 h-6" />
            {items.length > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                {items.length}
              </span>
            )}
          </button>
        )}

        {/* MODAL DEL CARRITO: Solo para pantallas pequeñas (<775px) y cuando está abierto */}
        {isSmallScreen && isCartModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-0 sm:p-4">
            <div className="bg-[var(--card)] rounded-none sm:rounded-xl shadow-lg w-full h-full sm:max-w-lg sm:max-h-[90vh] flex flex-col border-none sm:border border-[var(--border)]">
              <div className="p-4 border-b border-[var(--border)] flex justify-between items-center">
                <h2 className="text-xl font-bold text-[var(--foreground)]">
                  Tu Carrito
                </h2>
                <button
                  onClick={() => setIsCartModalOpen(false)}
                  className="text-[var(--muted2)] hover:text-[var(--foreground)]"
                  aria-label="Close cart modal"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <CarritoCompra
                  onCloseCartModal={() => setIsCartModalOpen(false)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TiendaPage;
