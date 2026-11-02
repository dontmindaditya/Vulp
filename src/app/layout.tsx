import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PlayerProvider } from "@/components/providers/PlayerProvider";

export const metadata: Metadata = {
  title: "bow tie's music player",
  description:
    "Hello welcome to bow tie's music player. Late night sounds, vinyl records and cozy playlists.",
};

export const viewport: Viewport = {
  themeColor: "#050507",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>
        <PlayerProvider>{children}</PlayerProvider>
      </body>
    </html>
  );
}
