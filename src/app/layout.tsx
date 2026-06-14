import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { SiteFooter } from "@/components/SiteFooter";
import { ClickSound } from "@/components/ClickSound";

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
  metadataBase: new URL("https://summersharp.app"),
  title: "SummerSharp — Stay sharp all summer!",
  description:
    "A fun summer learning app for Florida K–5 students. Practice math and reading, earn XP, keep your streak, and unlock badges!",
  applicationName: "SummerSharp",
  appleWebApp: {
    capable: true,
    title: "SummerSharp",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
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
        {children}
        <SiteFooter />
        <ClickSound />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
