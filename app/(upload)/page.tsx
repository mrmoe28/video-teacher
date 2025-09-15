import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Upload, Link2, Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default function UploadPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <Card className="glass-strong">
        <CardHeader>
          <CardTitle className="text-white">Upload or Paste YouTube URL</CardTitle>
          <CardDescription className="text-gray-300">We will fetch the video, transcribe it, and prepare learning materials.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm text-gray-300">YouTube URL</label>
              <div className="flex gap-2">
                <Input placeholder="https://www.youtube.com/watch?v=..." aria-label="YouTube URL" />
                <Button className="rounded-full bg-gradient-to-r from-violet-500 to-pink-500 text-white">
                  <Link2 className="w-4 h-4 mr-2" />
                  Analyze
                </Button>
              </div>
              <p className="text-xs text-gray-400">Supports public videos. Private videos require manual upload.</p>
            </div>

            <div className="space-y-3">
              <label className="text-sm text-gray-300">Upload video file</label>
              <div className="glass-effect rounded-lg p-6 text-center">
                <Upload className="w-5 h-5 text-white mx-auto mb-2" />
                <p className="text-gray-300">Drag & drop your .mp4 or .mov here</p>
                <p className="text-xs text-gray-400">Max 500MB</p>
                <div className="mt-4">
                  <Button variant="outline" className="rounded-full border-white/20 text-white hover:bg-white/10">Choose file</Button>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="flex items-center gap-3 text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Processing queue average time: under 1 minute</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
