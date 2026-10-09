import { extractYouTubeId } from "@/lib/youtube";

export default function YouTubeEmbed({ url }: { url: string }) {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;

  return (
    <div className="aspect-video w-full overflow-hidden">
      {/* youtube-nocookie: no YouTube cookies until the visitor plays the video (see /privacy). */}
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}`}
        title="Embedded YouTube video"
        className="h-full w-full"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
