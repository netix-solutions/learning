import { SITE_URL } from "@/lib/site-url";
import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { SpeechNotice } from "@/components/SpeechNotice";
import { AppFooter } from "@/components/AppFooter";
import { MeadowScene } from "@/components/MeadowScene";
import { ClickSound } from "@/components/ClickSound";
import { BackgroundMusic } from "@/components/BackgroundMusic";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";

const fredoka = Fredoka({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const nunito = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "SunSharp — Stay sharp all summer!",
  description:
    "A fun summer learning app for Florida K–5 students. Practice math, reading, and science, grow your learning garden!",
  applicationName: "SunSharp",
  appleWebApp: {
    capable: true,
    title: "SunSharp",
    statusBarStyle: "default",
  },
  // favicon.ico is auto-linked from src/app/favicon.ico (covers legacy + every
  // browser tab). These add crisp hi-res icons for modern browsers and iOS.
  icons: {
    icon: [
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/apple-touch-icon.png",
  },
  // og:image / twitter:image are injected automatically from
  // src/app/opengraph-image.tsx and twitter-image.tsx.
  openGraph: {
    type: "website",
    siteName: "SunSharp",
    url: SITE_URL,
    title: "SunSharp — Stay sharp all summer!",
    description:
      "A fun summer learning app for Florida K–5 students. Practice math, reading, and science, grow your learning garden!",
  },
  twitter: {
    card: "summary_large_image",
    title: "SunSharp — Stay sharp all summer!",
    description:
      "A fun summer learning app for Florida K–5 students. Practice math, reading, and science, grow your learning garden!",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Let content flow under the notch/home indicator; we add safe-area padding in CSS.
  viewportFit: "cover",
  themeColor: "#fef6ff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fredoka.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="flex min-h-screen flex-col">
        <MeadowScene />
        {children}
        <AppFooter />
        <SpeechNotice />
        <ClickSound />
        <BackgroundMusic />
        <ServiceWorkerRegister />
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
      </body>
    </html>
  );
}
