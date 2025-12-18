"use client";

import { useState } from "react";
import RadioPlayer from "./RadioPlayerFixed";
import ZenoEmbedPlayer from "./ZenoEmbedPlayer";

interface CombinedRadioPlayerProps {
  className?: string;
  defaultPlayer?: "native" | "embed";
  stationSlug?: string;
  streamUrl?: string;
  stationName?: string;
}

export default function CombinedRadioPlayer({
  className = "",
  defaultPlayer = "native",
  stationSlug = "fgm-radio-haiti",
  streamUrl = "https://stream.zeno.fm/ttq4haexcf9uv",
  stationName = "HFRP Radio",
}: CombinedRadioPlayerProps) {
  const [activePlayer, setActivePlayer] = useState<"native" | "embed">(
    defaultPlayer,
  );

  return (
    <div className={`combined-radio-player ${className}`}>
      {/* Player Selection Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => setActivePlayer("native")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activePlayer === "native"
              ? "border-red-500 text-red-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          🎵 Native Player
        </button>
        <button
          onClick={() => setActivePlayer("embed")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activePlayer === "embed"
              ? "border-red-500 text-red-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          📻 Zeno.FM Player
        </button>
      </div>

      {/* Active Player */}
      <div className="player-content">
        {activePlayer === "native" ? (
          <RadioPlayer
            streamUrl={streamUrl}
            stationName={stationName}
            variant="full"
            showSizeControls={true}
          />
        ) : (
          <ZenoEmbedPlayer stationSlug={stationSlug} width="100%" height={250} />
        )}
      </div>

      {/* Player Info */}
      <div className="mt-4 text-sm text-gray-600">
        <div className="flex items-center justify-between">
          <span>
            {activePlayer === "native"
              ? "🎵 Direct stream player"
              : "📻 Full-featured Zeno.FM player"}
          </span>
          <span className="text-xs">
            {activePlayer === "native"
              ? "Lower data usage"
              : "Full features & chat"}
          </span>
        </div>
      </div>
    </div>
  );
}
