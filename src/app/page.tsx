import FadeSeparator from "./components/stylecomponents/FadeSeparator";
import Hero from "./components/Hero";
import Gallery from "./components/gallery";
import Introduction from "./components/Introduction";
import Testimonials from "./components/Testimonials ";
import SocialMediaSection from "./components/SocialMediaSection";




export default function Home() {
  return (
    <div >
      <Hero/>
      <FadeSeparator/>
      <Introduction/>
      
      <Gallery/>
      <Testimonials/>
      <SocialMediaSection/>
    
      
     
    </div>
  );
}
