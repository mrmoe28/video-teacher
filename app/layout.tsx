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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
