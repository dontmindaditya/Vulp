import { requireAdmin } from "@/features/auth/services/auth.service";
import { getAllTracks } from "@/features/tracks/services/track.service";
import { getAllPlaylists } from "@/features/playlists/services/playlist.service";
import TrackManagerClient from "./TrackManagerClient";

export default async function AdminTracksPage() {
    await requireAdmin();

    const [tracks, playlists] = await Promise.all([
        getAllTracks(),
        getAllPlaylists(),
    ]);

    return (
        <TrackManagerClient
            initialTracks={tracks}
            playlists={playlists}
        />
    );
}
