import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Star, Users, Zap, Shield, Brain, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 glass-strong" aria-label="Primary">
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
            <a href="#features" className="text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900 rounded px-2 py-1">Features</a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900 rounded px-2 py-1">Pricing</a>
            <a href="#about" className="text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900 rounded px-2 py-1">About</a>
          </div>
          <Link href="/upload">
            <Button className="rounded-full px-5 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white border-0 focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 py-20 text-center" aria-labelledby="hero-heading">
        <div className="pointer-events-none absolute inset-x-0 -top-10 mx-auto h-40 max-w-4xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 blur-3xl" />
        <div className="max-w-5xl mx-auto">
          <Badge variant="secondary" className="mb-6 border-white/10 bg-white/10 text-white">
            🚀 AI-Powered Learning Platform
          </Badge>
          <h1 id="hero-heading" className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            <span className="gradient-text">Transform Any Video</span>
            <br />
            Into Interactive Learning
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            Turn YouTube videos into comprehensive study materials with AI-powered analysis, transcripts, flashcards, and personalized learning paths.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/upload">
              <Button size="lg" className="rounded-full text-base h-12 px-8 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900">
                Start Learning Now
                <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
              </Button>
            </Link>
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

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Simple, Transparent
            <span className="gradient-text"> Pricing</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Choose the plan that fits your learning needs. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="glass-effect hover-lift">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Free</CardTitle>
              <CardDescription className="text-gray-300">Perfect for getting started</CardDescription>
              <div className="text-4xl font-bold text-white">$0<span className="text-lg text-gray-400">/month</span></div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  5 videos per month
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Basic AI analysis
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Standard transcripts
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass-effect hover-lift border-violet-500/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="text-white text-2xl">Pro</CardTitle>
                <Badge className="bg-violet-500 text-white">Popular</Badge>
              </div>
              <CardDescription className="text-gray-300">For serious learners</CardDescription>
              <div className="text-4xl font-bold text-white">$19<span className="text-lg text-gray-400">/month</span></div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Unlimited videos
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Advanced AI analysis
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Smart flashcards
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Progress tracking
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass-effect hover-lift">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Team</CardTitle>
              <CardDescription className="text-gray-300">For organizations</CardDescription>
              <div className="text-4xl font-bold text-white">$49<span className="text-lg text-gray-400">/month</span></div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Everything in Pro
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Team collaboration
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Admin dashboard
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Priority support
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            About
            <span className="gradient-text"> VideoTeacher</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            We believe that every video has the potential to be a powerful learning tool. 
            Our AI-powered platform makes it easy to extract knowledge and create engaging study materials.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-bold text-white mb-6">Our Mission</h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              To democratize education by making any video content accessible, searchable, and learnable. 
              We use cutting-edge AI to transform passive video watching into active learning experiences.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-semibold">AI-Powered Analysis</h4>
                  <p className="text-gray-300 text-sm">Advanced algorithms extract key concepts and insights</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-semibold">Interactive Learning</h4>
                  <p className="text-gray-300 text-sm">Transform videos into engaging study materials</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-semibold">Progress Tracking</h4>
                  <p className="text-gray-300 text-sm">Monitor your learning journey with detailed analytics</p>
                </div>
              </div>
            </div>
          </div>
          <div className="glass-effect rounded-xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 flex items-center justify-center mx-auto mb-6">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Join Our Community</h3>
            <p className="text-gray-300 mb-6">
              Over 10,000 learners are already using VideoTeacher to study smarter and learn faster.
            </p>
            <div className="flex justify-center gap-4 text-2xl font-bold text-white">
              <div>10K+ <span className="text-sm text-gray-400 font-normal">Users</span></div>
              <div>50K+ <span className="text-sm text-gray-400 font-normal">Videos</span></div>
              <div>1M+ <span className="text-sm text-gray-400 font-normal">Cards</span></div>
            </div>
          </div>
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
              <Link href="/upload">
                <Button size="lg" className="rounded-full text-base h-12 px-8 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
                </Button>
              </Link>
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
                <li><a href="#features" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900 rounded">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900 rounded">Pricing</a></li>
                <li><Link href="/upload" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900 rounded">Get Started</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#about" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900 rounded">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900 rounded">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900 rounded">Careers</a></li>
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
