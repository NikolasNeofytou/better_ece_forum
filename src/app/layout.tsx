import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Better ECE Forum",
  description: "A modern forum platform for NTUA ECE students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
