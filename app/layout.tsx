import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-[radial-gradient(60%_60%_at_50%_0%,rgba(168,85,247,0.15),rgba(236,72,153,0)_60%),radial-gradient(40%_40%_at_100%_0%,rgba(6,182,212,0.12),rgba(6,182,212,0)_60%)]`}
      >
        <div className="relative min-h-screen">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom_right,rgba(255,255,255,0.04),transparent)]" />
          <div className="pointer-events-none absolute -top-40 right-0 h-[480px] w-[480px] rounded-full bg-gradient-to-tr from-purple-500/20 via-pink-500/10 to-cyan-400/20 blur-3xl" />
          <div className="mx-auto container px-4 py-6">
            <div className="rounded-xl glass-strong">
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
