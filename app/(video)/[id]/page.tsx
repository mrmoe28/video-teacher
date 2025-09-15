import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Brain, FileText, Play, Sparkles } from "lucide-react";

export default function VideoDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-video rounded-xl overflow-hidden glass-effect grid place-items-center">
            <Play className="w-10 h-10 text-white" />
          </div>

          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-white">Video Overview</CardTitle>
              <CardDescription className="text-gray-300">ID: {params.id}</CardDescription>
            </CardHeader>
            <CardContent className="text-gray-300">
              Short description of the video content, topics, and objectives.
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2"><Brain className="w-4 h-4" /> AI Insights</CardTitle>
              <CardDescription className="text-gray-300">Key takeaways generated from the transcript.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li>Concept 1 summary</li>
                <li>Concept 2 summary</li>
                <li>Concept 3 summary</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2"><FileText className="w-4 h-4" /> Transcript</CardTitle>
              <CardDescription className="text-gray-300">Timestamped transcript preview.</CardDescription>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-3">
              <p>[00:00] Intro and goals</p>
              <p>[00:45] Topic A explained</p>
              <p>[02:10] Topic B and examples</p>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2"><Sparkles className="w-4 h-4" /> Study Materials</CardTitle>
              <CardDescription className="text-gray-300">Flashcards and quizzes.</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button className="rounded-full bg-gradient-to-r from-violet-500 to-pink-500 text-white">Generate Deck</Button>
              <Button variant="outline" className="rounded-full border-white/20 text-white hover:bg-white/10">Create Quiz</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator className="my-10" />

      <div className="text-center text-gray-400">More related videos coming soon.</div>
    </div>
  );
}
