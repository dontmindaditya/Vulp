import { notFound } from "next/navigation";
import { requireAdmin } from "@/features/auth/services/auth.service";
import { getPlaylistWithTracks } from "@/features/playlists/services/playlist.service";
import { getAllTracks } from "@/features/tracks/services/track.service";
import EditPlaylistClient from "./EditPlaylistClient";

interface EditPlaylistPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditPlaylistPage({
    params,
}: EditPlaylistPageProps) {
    await requireAdmin();

    const { id } = await params;
    if (!id) {
        notFound();
    }

    const [playlistData, allTracks] = await Promise.all([
        getPlaylistWithTracks(id),
        getAllTracks(),
    ]);

    if (!playlistData) {
        notFound();
    }

    return (
        <EditPlaylistClient
            playlist={playlistData.playlist}
            initialTracks={playlistData.tracks}
            availableLibraryTracks={allTracks}
        />
    );
}
