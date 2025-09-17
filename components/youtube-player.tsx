"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { extractYouTubeVideoId } from "@/lib/youtube-url-parser";

interface YouTubePlayerProps {
  videoId: string;
  className?: string;
  autoplay?: boolean;
  onTimeUpdate?: (currentTime: number) => void;
  startTime?: number;
}

export function YouTubePlayer({
  videoId,
  className = "",
  autoplay = false,
  onTimeUpdate,
  startTime = 0
}: YouTubePlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!videoId) {
      setError("No video ID provided");
      setIsLoading(false);
      return;
    }

    // Extract YouTube ID using comprehensive parser
    const cleanVideoId = extractYouTubeVideoId(videoId) || videoId;
    
    // Validate video ID format
    if (!cleanVideoId || cleanVideoId.length !== 11) {
      setError("Invalid YouTube video ID");
      setIsLoading(false);
      return;
    }

    // Build iframe URL with parameters
    const params = new URLSearchParams({
      autoplay: autoplay ? '1' : '0',
      start: startTime.toString(),
      rel: '0', // Don't show related videos
      modestbranding: '1', // Minimal YouTube branding
      enablejsapi: '1', // Enable JavaScript API
      origin: window.location.origin
    });

    if (iframeRef.current) {
      iframeRef.current.src = `https://www.youtube.com/embed/${cleanVideoId}?${params.toString()}`;
    }

    setIsLoading(false);
    setError(null);
  }, [videoId, autoplay, startTime]);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setError("Failed to load video. Please check if the video ID is valid.");
    setIsLoading(false);
  };

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-black/50 rounded-xl ${className}`}>
        <div className="text-center p-6">
          <div className="text-red-400 mb-2">⚠️</div>
          <p className="text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-xl overflow-hidden bg-black ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      )}
      <iframe
        ref={iframeRef}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        title="YouTube video player"
        frameBorder="0"
      />
    </div>
  );
}