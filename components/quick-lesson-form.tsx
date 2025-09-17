"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { extractYouTubeVideoId, isValidYouTubeUrl } from "@/lib/youtube-url-parser";

interface QuickLessonFormProps {
  variant?: "default" | "compact";
  className?: string;
}

export function QuickLessonForm({ 
  variant = "default", 
  className = "" 
}: QuickLessonFormProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError("Please enter a YouTube URL");
      return;
    }

    // Use comprehensive YouTube URL validation
    if (!isValidYouTubeUrl(url)) {
      setError("Please enter a valid YouTube URL. Supports all YouTube URL formats including youtu.be, mobile, shorts, and more.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Extract video ID using comprehensive parser
      const videoId = extractYouTubeVideoId(url);
      if (!videoId) {
        throw new Error("Could not extract video ID from URL");
      }

      // Navigate to upload page with the video ID
      router.push(`/upload?videoId=${videoId}`);
    } catch (err) {
      setError("Failed to process YouTube URL. Please try again with a different format.");
      console.error("Error processing URL:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === "compact") {
    return (
      <div className={`w-full ${className}`}>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="url"
            placeholder="Paste YouTube URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="px-4 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white border-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
          </Button>
        </form>
        {error && (
          <div className="mt-2 flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      <div className="glass-effect rounded-xl p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            Create a Lesson from YouTube
          </h2>
          <p className="text-gray-300">
            Paste any YouTube URL to transform it into an interactive learning experience
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>
          
          <Button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="w-full bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white border-0 h-12"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Create Lesson
              </>
            )}
          </Button>
        </form>
        
        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}