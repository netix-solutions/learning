import { SITE_URL } from "@/lib/site-url";
import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Nunito, Open_Sans } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { SpeechNotice } from "@/components/SpeechNotice";
import { AppFooter } from "@/components/AppFooter";
import { StudentNavigation } from "@/components/StudentNavigation";
import { ClickSound } from "@/components/ClickSound";
import { BackgroundMusic } from "@/components/BackgroundMusic";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";

const nunito = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const openSans = Open_Sans({ variable: "--font-wordmark", subsets: ["latin"], weight: "800", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "SunSharp — Stay sharp all summer!",
  description:
    "A fun summer learning app for Florida K–5 students. Practice math, reading, and science, build a world of rewards!",
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
      "A fun summer learning app for Florida K–5 students. Practice math, reading, and science, build a world of rewards!",
  },
  twitter: {
    card: "summary_large_image",
    title: "SunSharp — Stay sharp all summer!",
    description:
      "A fun summer learning app for Florida K–5 students. Practice math, reading, and science, build a world of rewards!",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Let content flow under the notch/home indicator; we add safe-area padding in CSS.
  viewportFit: "cover",
  themeColor: "#fff9ef",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} ${openSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-screen flex-col">
        <a href="#main-content" className="skip-link">Skip to content</a>
        <StudentNavigation />
        <SpeechNotice />
        <div id="main-content" tabIndex={-1} className="site-content">{children}</div>
        <AppFooter />
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
