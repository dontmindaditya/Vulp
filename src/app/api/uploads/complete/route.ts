import { NextResponse } from "next/server";
import { authorizeAdminApi } from "@/features/auth/services/admin-api.service";
import { objectExists } from "@/lib/storage/b2";

export const runtime = "nodejs";

export async function POST(request: Request) {
    const { admin, response } = await authorizeAdminApi();

    if (!admin) {
        return response!;
    }

    try {
        const body = (await request.json()) as { objectKey?: unknown };
        const objectKey = body?.objectKey;

        if (typeof objectKey !== "string" || !objectKey) {
            return NextResponse.json(
                { success: false, message: "Missing object key." },
                { status: 400 }
            );
        }

        const exists = await objectExists(objectKey);
        if (!exists) {
            return NextResponse.json(
                { success: false, message: "Object does not exist in storage." },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            verified: true,
            objectKey,
        });
    } catch (err) {
        console.error("Upload completion verification failed:", err);
        return NextResponse.json(
            { success: false, message: "Failed to verify upload in storage." },
            { status: 500 }
        );
    }
}
