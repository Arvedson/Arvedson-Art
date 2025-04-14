"use client";

import React, { useEffect, useRef, useState } from "react";
import { SunIcon, MoonIcon, ShoppingCartIcon } from "@heroicons/react/24/solid";
import useTheme from "@/hooks/useTheme";
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import CarritoCompra from "../../app/components/cart/Carrito";

interface NavbarProps {
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isMobileMenuOpen, toggleMobileMenu }) => {
  const theme = useTheme();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { state } = useCart();
  const productos = state.items;
  const [animateCartButton, setAnimateCartButton] = useState(false);
  const prevCartCount = useRef(productos.length);

  // Efecto para animar el botón del carrito
  useEffect(() => {
    if (productos.length > prevCartCount.current) {
      setAnimateCartButton(true);
      setTimeout(() => setAnimateCartButton(false), 1000);
    }
    prevCartCount.current = productos.length;
  }, [productos.length]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const toggleCart = () => {
    setIsCartOpen((prev) => !prev);
  };

  const navItems = [
    { label: "Tienda", href: "/tienda" },
    { label: "Inicio", href: "/" },
    { label: "Acerca de", href: "/about" },
    { label: "Servicios", href: "/services" },
    { label: "Contacto", href: "/contact" },
    { label: "Sobre Mí", href: "/sobremi" },
  ];

  // Manejador de clic fuera del menú móvil
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        isMobileMenuOpen
      ) {
        toggleMobileMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen, toggleMobileMenu]);

  return (
    <>
      <style>{`
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
      `}</style>

      {/* Navbar Principal */}
      <nav   className={`transition-all duration-300 sticky top-0 z-[999] relative ${ // Añadimos 'relative'
    theme === "light"
      ? "bg-white text-gray-900 border-[#d4af37]"
      : "bg-gray-900 text-white border-gray-700"
  }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <h1 className={`text-2xl font-bold ${
                  theme === "light" ? "text-gray-900" : "text-white"
                }`}>
                  Arvedson • Art
                </h1>
              </Link>
            </div>

            {/* Navegación Desktop */}
            <div className="hidden md:flex space-x-4 items-center">
              {navItems.map((item, index) => (
                <Link key={index} href={item.href} className="no-underline">
                  <span className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${
                    theme === "light"
                      ? "hover:bg-gray-200 text-gray-900"
                      : "hover:bg-gray-700 text-white"
                  }`}>
                    {item.label}
                  </span>
                </Link>
              ))}
              {/* Botones de Carrito y Tema */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleCart}
                  className={`relative p-2 rounded-md transition-colors duration-300 ${
                    theme === "light"
                      ? "hover:bg-gray-200"
                      : "hover:bg-gray-700"
                  } ${animateCartButton ? "animate-bounce" : ""}`}
                >
                  <div className="relative h-6 w-6">
                    {productos.length > 0 && (
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 animate-gradient-x rounded-md mask-cart"/>
                    )}
                    <ShoppingCartIcon
                      className={`h-6 w-6 ${
                        productos.length > 0 
                          ? "text-transparent" 
                          : theme === "light" 
                            ? "text-gray-900" 
                            : "text-white"
                      }`}
                    />
                  </div>
                </button>
                <button
                  onClick={toggleTheme}
                  className={`p-2 rounded-md transition-colors duration-300 ${
                    theme === "light"
                      ? "hover:bg-gray-200"
                      : "hover:bg-gray-700"
                  }`}
                >
                  {theme === "light" ? (
                    <MoonIcon className="h-6 w-6 text-yellow-400" />
                  ) : (
                    <SunIcon className="h-6 w-6 text-yellow-300" />
                  )}
                </button>
              </div>
            </div>

            {/* Navegación Mobile */}
            <div className="flex md:hidden items-center space-x-4">
              <button
                onClick={toggleCart}
                className={`relative p-2 rounded-md transition-colors duration-300 ${
                  theme === "light"
                    ? "hover:bg-gray-200"
                    : "hover:bg-gray-700"
                } ${animateCartButton ? "animate-bounce" : ""}`}
              >
                <div className="relative h-6 w-6">
                  {productos.length > 0 && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 animate-gradient-x rounded-md mask-cart"/>
                  )}
                  <ShoppingCartIcon
                    className={`h-6 w-6 ${
                      productos.length > 0 
                        ? "text-transparent" 
                        : theme === "light" 
                          ? "text-gray-900" 
                          : "text-white"
                    }`}
                  />
                </div>
              </button>
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-md transition-colors duration-300 ${
                  theme === "light"
                    ? "hover:bg-gray-200"
                    : "hover:bg-gray-700"
                }`}
              >
                {theme === "light" ? (
                  <MoonIcon className="h-6 w-6 text-yellow-400" />
                ) : (
                  <SunIcon className="h-6 w-6 text-yellow-300" />
                )}
              </button>
              <button
                onClick={toggleMobileMenu}
                className={`p-2 rounded-md transition-colors duration-300 ${
                  theme === "light"
                    ? "hover:bg-gray-200"
                    : "hover:bg-gray-700"
                }`}
              >
                {/* Iconos del menú móvil */}
                {isMobileMenuOpen ? (
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Menú Mobile */}
        <div
          ref={mobileMenuRef}
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            isMobileMenuOpen ? "max-h-[500px]" : "max-h-0"
          }`}
        >
          {navItems.map((item, index) => (
            <Link key={index} href={item.href} className="no-underline">
              <span
                onClick={toggleMobileMenu}
                className={`block px-3 py-2 text-base font-medium transition-colors duration-300 ${
                  theme === "light"
                    ? "hover:bg-gray-200 text-gray-900"
                    : "hover:bg-gray-700 text-white"
                }`}
              >
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Carrito de Compras - Solución Key */}
      <div
        className={`fixed top-16 right-0 h-[calc(100vh-4rem)] w-full md:w-96 z-[1000] ${
          theme === "light" ? "bg-white" : "bg-gray-800"
        } transform transition-transform duration-300 shadow-xl ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="relative h-full flex flex-col">
          {/* Header del Carrito */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-bold">Detalles del pedido</h2>
            <button
              onClick={toggleCart}
              className={`p-2 rounded-full ${
                theme === "light"
                  ? "hover:bg-gray-100"
                  : "hover:bg-gray-700"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Contenido Scrollable */}
          <div className="flex-1 overflow-y-auto p-4">
            <CarritoCompra />
          </div>
        </div>
      </div>

      {/* Estilos Globales */}
      <style jsx global>{`
        .mask-cart {
          mask: url("data:image/svg+xml,${encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z"/></svg>`
          )}") center / contain no-repeat;
        }
          nav::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 1px; /* Grosor del borde */
    z-index: 99999; /* Z-index muy alto */
    background-color: ${theme === "light" ? "#d4af37" : "gray-700"}; /* Color del borde */
  }
      `}</style>
    </>
  );
};

export default Navbar;