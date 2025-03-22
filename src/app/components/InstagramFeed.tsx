"use client";

import React, { useState, useEffect } from "react";

// Mock para publicaciones de Instagram
const mockPosts = [
  {
    id: "1",
    imageUrl: "https://via.placeholder.com/300x300", // Reemplaza con URLs reales
    caption: "¡Descubre nuestras nuevas obras de arte! 🎨✨",
    link: "https://www.instagram.com/p/C4NA0xAOqtl/?img_index=1",
  },
  {
    id: "2",
    imageUrl: "https://www.instagram.com/p/C4_zNzWrY_z/?img_index=1",
    caption: "Detalles que cuentan historias. 🖌️",
    link: "https://instagram.com/youraccount",
  },
  {
    id: "3",
    imageUrl: "https://via.placeholder.com/300x300",
    caption: "Diseños únicos para tu hogar. 🏠",
    link: "https://instagram.com/youraccount",
  },
];

export default function InstagramFeed() {
  const [posts, setPosts] = useState(mockPosts); // Usa mock mientras configuras la API

  // Simula una carga desde una API (reemplázalo con la API real más adelante)
  useEffect(() => {
    // Aquí puedes agregar lógica para fetchear desde Instagram API
    setPosts(mockPosts); // Usar el mock temporalmente
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)] p-6">
      <h1 className="text-4xl font-bold text-center mb-8 text-[var(--foreground)]">
        Nuestras Publicaciones en Instagram
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {posts.map((post) => (
          <a
            key={post.id}
            href={post.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group block bg-[var(--muted)] border border-[var(--border)] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="relative w-full aspect-square">
              <img
                src={post.imageUrl}
                alt={post.caption}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <p
                className="text-sm text-[var(--foreground)] truncate group-hover:text-[var(--primary)]"
                title={post.caption}
              >
                {post.caption}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
