import Gallery from "../components/gallery";


// Component for the full gallery page (e.g., "/galeria")
export default function GalleryPage() {
  return (
    <div style={{ height: "auto" }}> {/* Changed height to "auto" */}
      <Gallery showMoreCard={false} /> {/* Show all items, without "Ver Galería" card */}
    </div>
  );
}
