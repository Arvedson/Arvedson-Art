"use client";
import useTheme from "@/hooks/useTheme";
import { FaInstagram, FaFacebookF, FaWhatsapp } from "react-icons/fa";

export default function Footer() {
  const theme = useTheme();

  return (
    <footer className={`${theme === "light" ? "bg-gray-50" : "bg-gray-900"} border-t ${
      theme === "light" ? "border-gray-200" : "border-gray-800"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12 text-center md:text-left">
          {/* Columna 1 - Branding */}
          <div className="space-y-4 flex flex-col items-center md:items-start">
            <h2 className={`text-xl font-bold ${
              theme === "light" ? "text-gray-900" : "text-white"
            }`}>
              Arvedson Art
            </h2>
            <p className={`text-sm max-w-[200px] ${
              theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}>
              Transformando espacios con arte personalizado desde 2015
            </p>
          </div>

          {/* Columna 2 - Enlaces rápidos */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className={`text-sm font-semibold mb-4 ${
              theme === "light" ? "text-gray-900" : "text-gray-100"
            }`}>
              Navegación
            </h3>
            <ul className="space-y-2">
              {[
                { name: "Galería", link: "/galeria" },
                { name: "Contacto", link: "/contact" },
                { name: "Servicios", link: "/services" }
              ].map((item) => (
                <li key={item.name}>
                  <a
                    href={item.link}
                    className={`text-sm transition-colors hover:text-[var(--primary)] ${
                      theme === "light" ? "text-gray-600" : "text-gray-400"
                    }`}
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3 - Contacto */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className={`text-sm font-semibold mb-4 ${
              theme === "light" ? "text-gray-900" : "text-gray-100"
            }`}>
              Contacto
            </h3>
            <ul className={`space-y-2 ${
              theme === "light" ? "text-gray-600" : "text-gray-400"
            }`}>
              <li className="text-sm">domiarvedson@hotmail.com</li>
              <li className="text-sm">+52 871 118 0230</li>
              <li className="text-sm">Torreón, México</li>
            </ul>
          </div>

          {/* Columna 4 - Redes sociales */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className={`text-sm font-semibold mb-4 ${
              theme === "light" ? "text-gray-900" : "text-gray-100"
            }`}>
              Síguenos
            </h3>
            <div className="flex space-x-4">
              {[
                {
                  name: "Instagram",
                  icon: FaInstagram,
                  color: "#E1306C",
                  link: "https://www.instagram.com/arvedson.art/"
                },
                {
                  name: "Facebook",
                  icon: FaFacebookF,
                  color: "#1877F2",
                  link: "https://www.facebook.com/domiarvedson"
                },
                {
                  name: "WhatsApp",
                  icon: FaWhatsapp,
                  color: "#25D366",
                  link: "https://wa.me/528711180230"
                }
              ].map((social) => (
                <a
                  key={social.name}
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2.5 rounded-full transition-all ${
                    theme === "light" 
                      ? "bg-gray-200 hover:bg-[var(--primary)] text-gray-600 hover:text-white" 
                      : "bg-gray-800 hover:bg-[var(--primary)] text-gray-300 hover:text-white"
                  }`}
                  aria-label={social.name}
                >
                  <social.icon 
                    className="w-5 h-5" 
                    style={{ color: theme === "light" ? "currentColor" : social.color }}
                  />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Separador */}
        <hr className={`my-8 ${theme === "light" ? "border-gray-200" : "border-gray-800"}`} />

        {/* Copyright y legal */}
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left space-y-2 md:space-y-0">
          <p className={`text-sm ${
            theme === "light" ? "text-gray-500" : "text-gray-400"
          }`}>
            &copy; {new Date().getFullYear()} Arvedson Art. Todos los derechos reservados.
          </p>
          
          <div className="flex space-x-4">
            <a
              href="#"
              className={`text-sm hover:text-[var(--primary)] transition-colors ${
                theme === "light" ? "text-gray-600" : "text-gray-400"
              }`}
            >
              Política de privacidad
            </a>
            <a
              href="#"
              className={`text-sm hover:text-[var(--primary)] transition-colors ${
                theme === "light" ? "text-gray-600" : "text-gray-400"
              }`}
            >
              Términos de servicio
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}