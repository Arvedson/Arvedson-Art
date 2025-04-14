"use client"
import FadeSeparator from "./components/stylecomponents/FadeSeparator";
import Hero from "./components/Hero";
import Gallery from "./components/gallery";
import Introduction from "./components/Introduction";
import Testimonials from "./components/Testimonials ";
import SocialMediaSection from "./components/SocialMediaSection";
import StoreInvitation from "./components/StoreInvitation";
import MobileGallery from "../app/components/MobileGallery"
import { useEffect, useState } from "react";




export default function Home() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
   
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkScreenSize();

    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  return (
    <div>
      <Hero />
      <FadeSeparator
        topColor="transparent"
        bottomColor="var(--secondary)"
        height={120}
      />
      <Introduction />
      <FadeSeparator 
        

        topColor={{
          light: "var(--primary-bg)",
          dark: "var(--background)"
        }}
        bottomColor={{
          light: "var(--primary-bg)",
          dark: "var(--primaryblue)"
        }}
        height={40}
 
      />
      <StoreInvitation/>
      <FadeSeparator 
        

        topColor={{
          light: "var(--primary-bg)",
          dark: "var(--primaryblue)"
        }}
        bottomColor={{
          light: "var(--background)",
          dark: "var(--primaryblue)"
        }}
        height={40}
 
      />
            {isMobile ? (
        <MobileGallery showMoreCard={true} maxItems={3} />
      ) : (
        <Gallery showMoreCard={true} maxItems={7} />
      )}
      <Testimonials />
      <SocialMediaSection />
    </div>
  );
}
