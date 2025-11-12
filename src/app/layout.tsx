import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/lib/auth/provider";
import { Header } from "@/components/layout/Header";
import { Toaster } from "@/components/ui/toaster";
import { PWAInstallPrompt } from "@/components/pwa/InstallPrompt";
import { PWARegistration } from "@/components/pwa/PWARegistration";
import { MobileNavigation } from "@/components/mobile/MobileNavigation";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Better ECE Forum",
    template: "%s | Better ECE Forum"
  },
  description: "A modern forum platform for NTUA ECE students",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ECE Forum"
  },
  formatDetection: {
    telephone: false
  },
  openGraph: {
    type: "website",
    siteName: "Better ECE Forum",
    title: "Better ECE Forum",
    description: "A modern forum platform for NTUA ECE students"
  },
  twitter: {
    card: "summary",
    title: "Better ECE Forum",
    description: "A modern forum platform for NTUA ECE students"
  }
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="antialiased pb-16 md:pb-0">
        <AuthProvider>
          <PWARegistration />
          <Header />
          {children}
          <Toaster />
          <PWAInstallPrompt />
          <MobileNavigation />
        </AuthProvider>
      </body>
    </html>
  );
}
