import { NextResponse } from "next/server";
import { authorizeAdminApi } from "@/features/auth/services/admin-api.service";
import { getPublishedPlaylists } from "@/features/playlists/services/playlist.service";

export async function GET() {
    // Public operation: anyone can fetch published playlists
    try {
        const playlists = await getPublishedPlaylists();
        return NextResponse.json({
            success: true,
            data: playlists,
        });
    } catch (err: unknown) {
        const message =
            err instanceof Error ? err.message : "Failed to fetch playlists.";
        return NextResponse.json({ success: false, message }, { status: 500 });
    }
}

export async function POST() {
    const { admin, response } = await authorizeAdminApi();

    if (!admin) {
        return response!;
    }

    // Only an authorized admin reaches this point.
    // 1. Validate request body with Zod.
    // 2. Create playlist in Supabase.

    return NextResponse.json(
        {
            success: false,
            message: "Playlist creation is not implemented yet.",
        },
        { status: 501 }
    );
}
