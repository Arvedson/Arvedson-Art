"use client";

import React, {  useEffect, useRef } from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";
import useTheme from "@/hooks/useTheme";
import Link from 'next/link';

interface NavbarProps {
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isMobileMenuOpen, toggleMobileMenu }) => {
  const theme = useTheme();
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const navItems = [
    { label: "Inicio", href: "/" },
    { label: "Acerca de", href: "/about" },
    { label: "Servicios", href: "/services" },
    { label: "Contacto", href: "/contact" },
  ];

  // Close menu when clicking outside
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
    <nav
      className={`transition-all duration-300 sticky top-0 z-[999] border-b ${theme === "light"
        ? "bg-white text-gray-900 border-[#d4af37]"
        : "bg-gray-900 text-white border-gray-700"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <h1
                className={`text-2xl font-bold ${theme === "light" ? "text-gray-900" : "text-white"
                  }`}
              >
                Arvedson • Art
              </h1>
            </Link>
          </div>

          <div className="hidden md:flex space-x-4 items-center">
            {navItems.map((item, index) => (
              <Link key={index} href={item.href} className="no-underline">
                <span
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${theme === "light"
                    ? "hover:bg-gray-200 text-gray-900"
                    : "hover:bg-gray-700 text-white"
                    }`}
                >
                  {item.label}
                </span>
              </Link>
            ))}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center p-2 rounded-md transition-colors duration-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
            >
              {theme === "light" ? (
                <MoonIcon className="h-6 w-6 text-yellow-400" />
              ) : (
                <SunIcon className="h-6 w-6 text-yellow-300" />
              )}
            </button>
          </div>

          <div className="flex md:hidden items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center p-2 rounded-md transition-colors duration-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
            >
              {theme === "light" ? (
                <MoonIcon className="h-6 w-6 text-yellow-400" />
              ) : (
                <SunIcon className="h-6 w-6 text-yellow-300" />
              )}
            </button>

            <button
              onClick={toggleMobileMenu}
              className="flex items-center justify-center p-2 rounded-md transition-colors duration-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu with Animation */}
      <div
        ref={mobileMenuRef}
        className={`md:hidden overflow-hidden transition-max-height duration-300 ease-in-out ${isMobileMenuOpen ? "max-h-[500px]" : "max-h-0"
          }`}
      >
        {navItems.map((item, index) => (
          <Link key={index} href={item.href} className="no-underline">
            <span
              onClick={toggleMobileMenu}
              className={`block px-3 py-2 text-base font-medium transition-colors duration-300 ${theme === "light"
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
  );
};

export default Navbar;
