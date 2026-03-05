import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans } from "next/font/google";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const notoSans = Noto_Sans({variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Cryptocurrency NZ | Swap',
    template: '%s | Cryptocurrency NZ',
  },
  description: 'Swap tokens instantly across chains on Cryptocurrency NZ',
  openGraph: {
    title: 'Cryptocurrency NZ | Swap',
    description: 'Swap tokens instantly across chains on Cryptocurrency NZ',
    siteName: 'Cryptocurrency NZ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cryptocurrency NZ | Swap',
    description: 'Swap tokens instantly across chains on Cryptocurrency NZ',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${notoSans.variable}`}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
