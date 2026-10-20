import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "app", description: "built with hackly" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-neutral-900 antialiased">{children}</body>
    </html>
  );
}
