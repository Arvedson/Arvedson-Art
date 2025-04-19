"use client";
import { useState, useEffect } from 'react';
import Gallery from "../components/gallery";
import MobileGallery from "../components/MobileGallery"; 

export default function GalleryPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [maxItems, setMaxItems] = useState(5);
  

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640);
      
      if (width >= 1024) {
        setMaxItems(100);
      } else if (width >= 640) {
        setMaxItems(100);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <div style={{ height: "auto" }}>
      {isMobile ? (
        <MobileGallery showMoreCard={false} maxItems={100} />
      ) : (
        <Gallery showMoreCard={false} maxItems={maxItems} />
      )}
    </div>
  );
}