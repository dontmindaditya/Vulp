import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MusicPlayer from "@/components/player/MusicPlayer";
import { getPlaylistBySlug } from "@/features/playlists/services/playlist.service";

interface PlaylistPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: PlaylistPageProps): Promise<Metadata> {
  const { slug } = await params;
  const playlist = await getPlaylistBySlug(slug);

  return {
    title: playlist ? `${playlist.name} — bow tie's music player` : "Playlist",
    description: playlist?.description ?? "Listen to curated playlist on VULP.",
  };
}

export default async function PlaylistPage({ params }: PlaylistPageProps) {
  const { slug } = await params;
  const playlist = await getPlaylistBySlug(slug);

  if (!playlist) {
    notFound();
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "transparent",
        color: "#f2eee9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
      }}
    >
      <div className="phone-frame">
        <MusicPlayer
          playlistSlug={playlist.slug}
          playlistName={playlist.name}
          showBackLink={true}
        />
      </div>
    </main>
  );
}
