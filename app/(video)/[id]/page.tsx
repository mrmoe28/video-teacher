"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Brain, FileText, Play, Sparkles, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { ErrorMessage } from "@/components/error-message";
import { LoadingSpinner } from "@/components/loading-spinner";

type VideoData = {
  video: {
    id: string;
    title: string;
    channel: string;
    duration: number;
    thumbnailUrl?: string;
    url: string;
  };
  hasTranscript: boolean;
  hasDeck: boolean;
  progress?: {
    videoId: string;
    userId?: string;
    percent: number;
    lastPosition?: number;
    updatedAt: string;
  };
};

type AnalysisData = {
  summary: string;
  topics: string[];
  keyMoments: Array<{
    timestamp: string;
    description: string;
    importance: 'high' | 'medium' | 'low';
  }>;
};

export default function VideoDetailPage(props: unknown) {
  const id = (props as { params?: { id?: string } })?.params?.id ?? "unknown";
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVideoData = async () => {
      try {
        setLoading(true);
        
        // Load video progress data
        const progressResponse = await fetch(`/api/progress?videoId=${id}`);
        if (progressResponse.ok) {
          const data = await progressResponse.json();
          setVideoData(data);
        } else {
          // If progress API fails, try to create basic video data from YouTube ID
          const youtubeId = id.startsWith('mock-') ? id.split('-')[1] : id;
          if (youtubeId && youtubeId.length === 11) { // YouTube IDs are 11 characters
            setVideoData({
              video: {
                id: id,
                title: 'Loading...',
                channel: 'Loading...',
                duration: 0,
                url: `https://www.youtube.com/watch?v=${youtubeId}`
              },
              hasTranscript: false,
              hasDeck: false
            });
          }
        }

        // Load analysis data
        const analysisResponse = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoId: id })
        });
        
        if (analysisResponse.ok) {
          const analysisData = await analysisResponse.json();
          setAnalysis(analysisData);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load video data');
      } finally {
        setLoading(false);
      }
    };

    if (id !== "unknown") {
      loadVideoData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <LoadingSpinner size="lg" text="Loading video data..." className="py-20" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-10">
        <Card className="glass-strong">
          <CardContent className="text-center py-16">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Error Loading Video</h2>
            <ErrorMessage error={error} className="max-w-md mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-video rounded-xl overflow-hidden glass-effect grid place-items-center">
            <Play className="w-10 h-10 text-white" />
            {videoData?.video.thumbnailUrl && (
              <Image 
                src={videoData.video.thumbnailUrl} 
                alt={videoData.video.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            )}
          </div>

          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-white">Video Overview</CardTitle>
              <CardDescription className="text-gray-300">
                {videoData?.video.title || 'Loading...'}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-gray-300">
              <div className="space-y-2">
                <p><strong>Channel:</strong> {videoData?.video.channel}</p>
                <p><strong>Duration:</strong> {videoData?.video.duration ? `${Math.floor(videoData.video.duration / 60)}:${(videoData.video.duration % 60).toString().padStart(2, '0')}` : 'Unknown'}</p>
                <p><strong>Status:</strong> {videoData?.hasTranscript ? 'Transcribed' : 'Not transcribed'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {analysis && (
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="w-4 h-4" /> AI Insights
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Key takeaways generated from the transcript.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-white font-semibold mb-2">Summary</h4>
                    <p className="text-gray-300 text-sm">{analysis.summary}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-white font-semibold mb-2">Topics</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.topics.map((topic, i) => (
                        <span key={i} className="px-2 py-1 bg-violet-500/20 text-violet-300 text-xs rounded">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-2">Key Moments</h4>
                    <div className="space-y-2">
                      {analysis.keyMoments.slice(0, 3).map((moment, i) => (
                        <div key={i} className="text-sm">
                          <span className="text-violet-300 font-mono">{moment.timestamp}</span>
                          <span className="text-gray-300 ml-2">{moment.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="w-4 h-4" /> Transcript
              </CardTitle>
              <CardDescription className="text-gray-300">
                {videoData?.hasTranscript ? 'Transcript available' : 'No transcript found'}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-3">
              {videoData?.hasTranscript ? (
                <div className="space-y-2">
                  <p>[00:00] Video introduction and overview</p>
                  <p>[00:45] Main topic discussion begins</p>
                  <p>[02:10] Key concepts and examples</p>
                  <p className="text-sm text-gray-400">... (transcript preview)</p>
                </div>
              ) : (
                <p className="text-gray-400">Transcript not available for this video.</p>
              )}
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Study Materials
              </CardTitle>
              <CardDescription className="text-gray-300">
                Generate flashcards and quizzes.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button className="rounded-full bg-gradient-to-r from-violet-500 to-pink-500 text-white">
                Generate Deck
              </Button>
              <Button variant="outline" className="rounded-full border-white/20 text-white hover:bg-white/10">
                Create Quiz
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator className="my-10" />

      <div className="text-center text-gray-400">More related videos coming soon.</div>
    </div>
  );
}