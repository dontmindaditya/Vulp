import { NextResponse } from "next/server";
import { authorizeAdminApi } from "@/features/auth/services/admin-api.service";
import {
    getAllTracks,
    getTracksByPlaylistSlug,
} from "@/features/tracks/services/track.service";

export const runtime = "nodejs";

export async function GET(request: Request) {
    // Public operation: anyone can fetch tracks or playlist tracks
    try {
        const { searchParams } = new URL(request.url);
        const playlistSlug = searchParams.get("playlistSlug");

        const tracks = playlistSlug
            ? await getTracksByPlaylistSlug(playlistSlug)
            : await getAllTracks();

        return NextResponse.json({
            success: true,
            data: tracks,
        });
    } catch (err: unknown) {
        const message =
            err instanceof Error ? err.message : "Failed to fetch tracks.";
        return NextResponse.json({ success: false, message }, { status: 500 });
    }
}

export async function POST() {
    const { admin, response } = await authorizeAdminApi();

    if (!admin) {
        return response!;
    }

    return NextResponse.json(
        {
            success: false,
            message: "Please use createTrackAction server action for track creation.",
        },
        { status: 501 }
    );
}
