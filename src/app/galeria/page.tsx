import Gallery from "../components/gallery";

export default function GalleryPage() {
  return (
    <div style={{ height: "100vh" }}>
      <Gallery showMoreCard={false} />
    </div>
  );
}