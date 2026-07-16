import YouTubeGallery from "../_components/YouTubeGallery";

export default function YouTubePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Our Videos</h1>
      <YouTubeGallery />
    </div>
  );
}
