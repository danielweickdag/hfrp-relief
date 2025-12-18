"use client";

interface ZenoEmbedPlayerProps {
  stationSlug?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  showBranding?: boolean;
}

export default function ZenoEmbedPlayer({
  stationSlug = "fgm-radio-haiti",
  width = "100%",
  height = 250,
  className = "",
  showBranding = true,
}: ZenoEmbedPlayerProps) {
  const playerUrl = `https://zeno.fm/player/${stationSlug}`;

  return (
    <div className={`zeno-embed-player ${className}`}>
      <iframe
        src={playerUrl}
        width={width}
        height={height}
        frameBorder="0"
        scrolling="no"
        title={`Zeno.FM Player - ${stationSlug}`}
        className="rounded-lg shadow-lg"
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
      />
      {showBranding && (
        <a
          href="https://zeno.fm/"
          target="_blank"
          rel="noopener noreferrer"
          className="block text-sm text-gray-500 hover:text-gray-700 transition-colors mt-1"
          style={{ fontSize: "0.9em", lineHeight: "10px" }}
        >
          A Zeno.FM Station
        </a>
      )}
    </div>
  );
}
