"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaintBrush, FaPalette, FaMagic, FaMapMarkerAlt } from 'react-icons/fa';
import { FiCheckCircle, FiX } from 'react-icons/fi';
import StockGrid from '../components/shop/StockGrid';
import ReplicaGrid from '../components/shop/ReplicaGrid';
import CuadroPersonalizado from '../components/shop/CuadroPersonalizado';
import CarritoCompra from '../components/cart/Carrito';
import AddressSection from '../components/AddressSection';
import { useCart } from '../../context/CartContext';
import { Address } from '../../types/types'; // Ajusta la ruta según tu estructura
import FadeSeparator from '../components/stylecomponents/FadeSeparator';

const TiendaPage = () => {
    const [selectedTab, setSelectedTab] = useState<'originales' | 'replicas' | 'personalizado'>('originales');
    const [mostrarDireccion, setMostrarDireccion] = useState(false);
    const [direccionTemporal, setDireccionTemporal] = useState<Address | null>(null);
    const heroRef = useRef<HTMLDivElement>(null);
    const [scrollPosition, setScrollPosition] = useState(0);
   
    
    const { state, dispatch } = useCart();

    useEffect(() => {
        const handleScroll = () => setScrollPosition(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const HeroSection = () => {
        const parallaxY = scrollPosition * 0.2;

        return (
            <div
                ref={heroRef}
                className="relative h-96 mb-2 overflow-hidden"
                style={{
                    backgroundImage: 'url(/hero1.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                
                
                <div className={`absolute inset-0 bg-gradient-to-r from-[var(--primaryblue)] to-[var(--primary)] opacity-80`} />
                
                <div className="container mx-auto px-4 h-full flex items-center relative z-10">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        className="text-[var(--white)]"
                    >
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 md:mb-6">
                            Tienda de Arte
                        </h1>
                        <p className="text-lg md:text-xl mb-6 md:mb-8">Descubre obras maestras únicas, réplicas personalizadas y crea tu propia obra</p>
                    </motion.div>
                </div>

                <motion.div
                    style={{ y: parallaxY }}
                    className="absolute inset-0 bg-cover bg-center pointer-events-none"
                />
            </div>
        );
    };

    const handleGuardarDireccion = () => {
        if (direccionTemporal) dispatch({ type: 'UPDATE_ADDRESS', payload: direccionTemporal });
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
            dark: "var(--background)"
          }}
        height={50}
      />

            <div className="container px-4 py-8 flex flex-col lg:flex-row gap-6 md:gap-8">
                {/* Sección Lateral */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full lg:w-72 xl:w-80 flex flex-col gap-4"
                >
                    <div className={`bg-[var(--card)] p-4 md:p-5 rounded-xl shadow-sm flex flex-col gap-3 border border-[var(--border)]`}>
                        <div className="flex flex-col gap-3">
                            <h3 className="text-lg font-semibold text-[var(--foreground)]">¿Necesitas ayuda?</h3>
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

                            <CarritoCompra />
                            
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`w-full bg-[var(--secondary)] text-[var(--primary)] py-2 rounded-lg flex items-center justify-center gap-2 
                                    hover:bg-[var(--accent)] hover:text-[var(--white)]`}
                                onClick={toggleDireccion}
                            >
                                <FaMapMarkerAlt className="text-lg" />
                                {state.address ? 'Cambiar Dirección' : 'Añadir Dirección'}
                            </motion.button>
                        </div>

                        <AnimatePresence>
                            {mostrarDireccion && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
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
                                                    ? 'bg-[var(--primary)] text-[var(--white)] hover:bg-[var(--accent)]' 
                                                    : 'bg-[var(--secondary)] text-[var(--muted)] cursor-not-allowed'
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

                {/* Contenido Principal */}
                <div className="flex-1">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 md:mb-8 gap-3">
                <div className="flex flex-wrap gap-2">
                    {(['originales', 'replicas', 'personalizado'] as const).map(tab => (
                        <motion.button
                            key={tab}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`flex items-center px-4 py-2.5 md:px-5 md:py-3 rounded-lg text-sm md:text-base ${
                                selectedTab === tab
                                ? `text-white shadow-lg ${
                                    tab === 'originales' ? 'bg-blue-600' :
                                    tab === 'replicas' ? 'bg-purple-600' :
                                    'bg-pink-600'
                                  }`
                                : 'bg-[var(--card)] text-[var(--muted2)] shadow-sm hover:shadow-md border border-[var(--border)]'
                            }`}
                            onClick={() => setSelectedTab(tab)}
                        >
                            {tab === 'originales' && <FaPaintBrush className="mr-2" />}
                            {tab === 'replicas' && <FaPalette className="mr-2" />}
                            {tab === 'personalizado' && <FaMagic className="mr-2" />}
                            {tab === 'originales' ? 'Obras Disponibles' : 
                             tab === 'replicas' ? 'Réplicas' : 'Personalizado'}
                        </motion.button>
                    ))}
                </div>
            </div>

                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={selectedTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {selectedTab === 'originales' ? (
                                <section>
                                    <h2 className="text-2xl md:text-3xl font-bold mb-6 text-[var(--foreground)] flex items-center">
                                        <FaPaintBrush className="mr-3 text-blue-600" />
                                        Obras Disponibles
                                    </h2>
                                    <StockGrid />
                                </section>
                            ) : selectedTab === 'replicas' ? (
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
            </div>
        </div>
    );
};

export default TiendaPage;