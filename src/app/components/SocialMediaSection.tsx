"use client";

import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa"; // Íconos de react-icons
import useTheme from "@/hooks/useTheme";

export default function SocialMediaSection() {
  const theme = useTheme();

  const socialLinks = [
    {
      name: "Facebook",
      icon: <FaFacebook className="h-10 w-10 text-blue-600" />,
      link: "https://www.facebook.com/domiarvedson",
    },
    {
      name: "Instagram",
      icon: <FaInstagram className="h-10 w-10 text-pink-500" />,
      link: "http://instagram.com/arvedson.art",
    },
    {
      name: "WhatsApp",
      icon: <FaWhatsapp className="h-10 w-10 text-green-500" />,
      link: "https://wa.me/52871180230"
    },
  ];

  return (
    <section
    className={` px-6 py-24 fade-in transition-all duration-300 mb-[80px] ${
      theme === "light"
        ? "bg-[var(--background)] text-[var(--foreground)]"
        : "bg-[var(--primaryblue)] text-[var(--primaryblue)]"
    }`}
    >
      <h2
        className={`text-3xl md:text-4xl font-bold mb-8 text-center ${
          theme === "light" ? "text-[var(--primary)]" : "text-[var(--primary)]"
        }`}
      >
        ¡Sígueme en mis Redes Sociales!
      </h2>
      <div className="flex flex-col sm:flex-row justify-center items-center gap-8">
        {socialLinks.map((social, index) => (
          <a
            key={index}
            href={social.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex flex-col items-center space-y-2 p-4 rounded-lg shadow-md hover:scale-105 transition-transform ${
              theme === "dark"
                ? "bg-[var(--secondary)] text-[var(--foreground)]"
                : "bg-[var(--muted)] text-[var(--foreground)]"
            }`}
          >
            {social.icon}
            <span className="text-lg font-medium">{social.name}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
