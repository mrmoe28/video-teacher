import type { Metadata } from "next";
import "./globals.css";
import { ErrorBoundary } from "@/components/error-boundary";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

export const metadata: Metadata = {
  title: {
    default: "Video Teacher - AI-Powered Learning Platform",
    template: "%s | Video Teacher"
  },
  description: "Transform any video into an interactive learning experience with AI-powered analysis, transcripts, and study materials.",
  keywords: ["video learning", "AI education", "transcript analysis", "study materials", "interactive learning"],
  authors: [{ name: "Video Teacher Team" }],
  creator: "Video Teacher",
  publisher: "Video Teacher",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://video-teacher.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Video Teacher - AI-Powered Learning Platform',
    description: 'Transform any video into an interactive learning experience with AI-powered analysis, transcripts, and study materials.',
    siteName: 'Video Teacher',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Video Teacher - AI-Powered Learning Platform',
    description: 'Transform any video into an interactive learning experience with AI-powered analysis, transcripts, and study materials.',
    creator: '@videoteacher',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  if (!clerkPublishableKey || clerkPublishableKey.includes('your_publishable_key_here') || clerkPublishableKey.includes('placeholder')) {
    return (
      <html lang="en" className="dark">
        <body className="antialiased min-h-screen bg-[radial-gradient(60%_60%_at_50%_0%,rgba(168,85,247,0.15),rgba(236,72,153,0)_60%),radial-gradient(40%_40%_at_100%_0%,rgba(6,182,212,0.12),rgba(6,182,212,0)_60%)] font-sans">
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white mb-4">Video Teacher</h1>
              <p className="text-gray-300">Please configure Clerk authentication keys in your .env.local file</p>
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <html lang="en" className="dark">
        <body
          className="antialiased min-h-screen bg-[radial-gradient(60%_60%_at_50%_0%,rgba(168,85,247,0.15),rgba(236,72,153,0)_60%),radial-gradient(40%_40%_at_100%_0%,rgba(6,182,212,0.12),rgba(6,182,212,0)_60%)] font-sans"
        >
          <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-black focus:text-white focus:px-3 focus:py-2">Skip to content</a>
          <header className="flex justify-end items-center p-4 gap-4 h-16">
            <SignedOut>
              <SignInButton />
              <SignUpButton>
                <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer hover:bg-[#5a3cd1] transition-colors">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </header>
          <div className="relative min-h-screen">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom_right,rgba(255,255,255,0.04),transparent)]" />
            <div className="pointer-events-none absolute -top-40 right-0 h-[480px] w-[480px] rounded-full bg-gradient-to-tr from-purple-500/20 via-pink-500/10 to-cyan-400/20 blur-3xl" />
            <div className="mx-auto container px-4 py-6">
              <main id="main" role="main" className="rounded-xl glass-strong outline-none" tabIndex={-1}>
                <ErrorBoundary>
                  {children}
                </ErrorBoundary>
              </main>
            </div>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
