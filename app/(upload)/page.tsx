"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Upload, Link2, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ErrorMessage } from "@/components/error-message";
import { LoadingSpinner } from "@/components/loading-spinner";

type JobStatus = 'idle' | 'crawling' | 'transcribing' | 'analyzing' | 'ready' | 'error';

export default function UploadPage() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [jobStatus, setJobStatus] = useState<JobStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<{
    summary: string;
    topics: string[];
    keyMoments: Array<{
      timestamp: string;
      description: string;
      importance: 'high' | 'medium' | 'low';
    }>;
  } | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleAnalyzeWithUrl = useCallback(async (urlToProcess: string) => {
    setIsLoading(true);
    setError(null);
    setJobStatus('crawling');

    try {
      // First, crawl the video to get metadata
      const crawlResponse = await fetch('/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToProcess })
      });

      if (!crawlResponse.ok) {
        const errorData = await crawlResponse.json();
        throw new Error(errorData.error || 'Failed to crawl video');
      }

      const crawlData = await crawlResponse.json();
      console.log('Crawl data received:', crawlData);
      console.log('Video ID from crawl:', crawlData.videoId);
      setJobStatus('transcribing');

      // Start transcription job
      const transcribeResponse = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: crawlData.videoId })
      });

      if (!transcribeResponse.ok) {
        const errorData = await transcribeResponse.json();
        throw new Error(errorData.error || 'Failed to start transcription');
      }

      await transcribeResponse.json();
      setJobStatus('transcribing');

      // Start analysis
      setJobStatus('analyzing');
      const analyzeResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: crawlData.videoId })
      });

      if (!analyzeResponse.ok) {
        const errorData = await analyzeResponse.json();
        throw new Error(errorData.error || 'Failed to analyze video');
      }

      const analysisData = await analyzeResponse.json();
      setAnalysis(analysisData);
      setJobStatus('ready');

      // Navigate to video page
      console.log('Navigating to:', `/video/${crawlData.videoId}`);
      router.push(`/video/${crawlData.videoId}`);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setJobStatus('error');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Handle videoId from URL parameter (support both videoId and videoid)
  useEffect(() => {
    const videoId = searchParams.get('videoId') || searchParams.get('videoid');
    if (videoId) {
      // Validate that this is a proper YouTube video ID (11 characters, alphanumeric + _ -)
      const isValidYouTubeId = /^[a-zA-Z0-9_-]{11}$/.test(videoId);
      
      if (isValidYouTubeId) {
        // Construct the YouTube URL from the video ID
        const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
        setUrl(youtubeUrl);
        // Automatically start processing
        handleAnalyzeWithUrl(youtubeUrl);
      } else {
        // Invalid video ID format - show error
        setError(`Invalid video ID format: "${videoId}". Please provide a valid YouTube video ID.`);
        setJobStatus('error');
      }
    }
  }, [searchParams, handleAnalyzeWithUrl]);

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError("Please enter a YouTube URL");
      return;
    }

    await handleAnalyzeWithUrl(url);
  };

  const getStatusMessage = () => {
    switch (jobStatus) {
      case 'crawling': return 'Fetching video metadata...';
      case 'transcribing': return 'Transcribing video content...';
      case 'analyzing': return 'Analyzing with AI...';
      case 'ready': return 'Analysis complete!';
      case 'error': return 'An error occurred';
      default: return 'Processing queue average time: under 1 minute';
    }
  };

  const getStatusIcon = () => {
    switch (jobStatus) {
      case 'ready': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />;
      default: return <Loader2 className="w-4 h-4 animate-spin" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <Card className="glass-strong">
        <CardHeader>
          <CardTitle className="text-white" id="upload-title">Upload or Paste YouTube URL</CardTitle>
          <CardDescription className="text-gray-300">We will fetch the video, transcribe it, and prepare learning materials.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label htmlFor="youtube-url" className="text-sm text-gray-300">YouTube URL</label>
              <div className="flex gap-2">
                <Input 
                  id="youtube-url"
                  placeholder="https://www.youtube.com/watch?v=..." 
                  aria-label="YouTube URL"
                  aria-describedby="url-help"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isLoading}
                  className="focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                />
                <Button 
                  className="rounded-full bg-gradient-to-r from-violet-500 to-pink-500 text-white focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                  onClick={handleAnalyze}
                  disabled={isLoading || !url.trim()}
                  aria-describedby="url-help"
                >
                  <Link2 className="w-4 h-4 mr-2" aria-hidden="true" />
                  Analyze
                </Button>
              </div>
              <p id="url-help" className="text-xs text-gray-400">Supports public videos. Private videos require manual upload.</p>
            </div>

            <div className="space-y-3">
              <label className="text-sm text-gray-300">Upload video file</label>
              <div className="glass-effect rounded-lg p-6 text-center">
                <Upload className="w-5 h-5 text-white mx-auto mb-2" />
                <p className="text-gray-300">Drag & drop your .mp4 or .mov here</p>
                <p className="text-xs text-gray-400">Max 500MB</p>
                <div className="mt-4">
                  <Button variant="outline" className="rounded-full border-white/20 text-white hover:bg-white/10" disabled>
                    Choose file
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <ErrorMessage 
              error={error} 
              onDismiss={() => setError(null)}
              className="mt-4"
            />
          )}

          <Separator className="my-8" />

          <div className="flex items-center gap-3 text-gray-400">
            {isLoading ? (
              <LoadingSpinner size="sm" text={getStatusMessage()} />
            ) : (
              <>
                {getStatusIcon()}
                <span>{getStatusMessage()}</span>
              </>
            )}
          </div>

          {analysis && (
            <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <h3 className="text-green-300 font-semibold mb-2">Analysis Complete!</h3>
              <p className="text-gray-300 text-sm mb-2">{analysis.summary}</p>
              <div className="flex flex-wrap gap-2">
                {analysis.topics?.slice(0, 3).map((topic: string, i: number) => (
                  <span key={i} className="px-2 py-1 bg-violet-500/20 text-violet-300 text-xs rounded">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}