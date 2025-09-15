import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Star, Users, Zap, Shield, Brain, ArrowRight, CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 glass-strong">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[conic-gradient(from_180deg_at_50%_50%,theme(colors.violet.500),theme(colors.pink.500),theme(colors.cyan.500),theme(colors.violet.500))] p-[1px]">
              <div className="w-full h-full rounded-[11px] bg-black/70 grid place-items-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
            </div>
            <span className="text-xl font-bold text-white">VideoTeacher</span>
            <Badge className="ml-2 hidden sm:inline-flex border-white/10 bg-white/10 text-white">v2</Badge>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
            <a href="#about" className="text-gray-300 hover:text-white transition-colors">About</a>
          </div>
          <Button className="rounded-full px-5 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white border-0">
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 py-20 text-center">
        <div className="pointer-events-none absolute inset-x-0 -top-10 mx-auto h-40 max-w-4xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 blur-3xl" />
        <div className="max-w-5xl mx-auto">
          <Badge variant="secondary" className="mb-6 border-white/10 bg-white/10 text-white">
            🚀 AI-Powered Learning Platform
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            <span className="gradient-text">Transform Any Video</span>
            <br />
            Into Interactive Learning
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            Turn YouTube videos into comprehensive study materials with AI-powered analysis, transcripts, flashcards, and personalized learning paths.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="rounded-full text-base h-12 px-8 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white">
              Start Learning Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button variant="outline" size="lg" className="rounded-full text-base h-12 px-8 border-white/20 text-white hover:bg-white/10">
              <Play className="mr-2 w-5 h-5" />
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Powerful Features for
            <span className="gradient-text"> Modern Learning</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Everything you need to transform videos into engaging, interactive learning experiences.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="glass-effect hover-lift h-full">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white text-xl">AI Analysis</CardTitle>
              <CardDescription className="text-gray-300">
                Advanced AI analyzes video content to extract key concepts, insights, and learning objectives.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="glass-effect hover-lift h-full">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white text-xl">Smart Transcripts</CardTitle>
              <CardDescription className="text-gray-300">
                Get accurate, timestamped transcripts with speaker identification and content categorization.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="glass-effect hover-lift h-full">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white text-xl">Study Groups</CardTitle>
              <CardDescription className="text-gray-300">
                Collaborate with others, share insights, and learn together in interactive study sessions.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="glass-effect hover-lift h-full">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white text-xl">Progress Tracking</CardTitle>
              <CardDescription className="text-gray-300">
                Monitor your learning progress with detailed analytics and personalized recommendations.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="glass-effect hover-lift h-full">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white text-xl">Flashcards</CardTitle>
              <CardDescription className="text-gray-300">
                Generate intelligent flashcards from video content for effective memorization and review.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="glass-effect hover-lift h-full">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white text-xl">Quizzes & Tests</CardTitle>
              <CardDescription className="text-gray-300">
                Create and take quizzes based on video content to test your understanding and retention.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="glass-strong">
          <CardContent className="text-center py-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of learners already using VideoTeacher to study smarter.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="rounded-full text-base h-12 px-8 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button variant="outline" size="lg" className="rounded-full text-base h-12 px-8 border-white/20 text-white hover:bg-white/10">
                Learn More
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="glass-effect border-t">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 grid place-items-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">VideoTeacher</span>
              </div>
              <p className="text-gray-400">
                Transform any video into an interactive learning experience with AI-powered analysis.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 VideoTeacher. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
