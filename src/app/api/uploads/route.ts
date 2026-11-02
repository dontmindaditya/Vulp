import { NextResponse } from "next/server";

import { getAdminUser } from "@/features/auth/services/auth.service";
import { createUploadUrl } from "@/features/uploads/services/upload.service";

export const runtime = "nodejs";

interface UploadRequestBody {
    kind: "audio" | "artwork";
    fileName: string;
    contentType: string;
    fileSize: number;
}

export async function POST(request: Request) {
    try {
        const admin = await getAdminUser();

        if (!admin) {
            return NextResponse.json(
                { success: false, message: "Unauthorized." },
                { status: 401 }
            );
        }

        const body = (await request.json()) as Partial<UploadRequestBody>;

        if (
            body.kind !== "audio" &&
            body.kind !== "artwork"
        ) {
            return NextResponse.json(
                { success: false, message: "Invalid upload type." },
                { status: 400 }
            );
        }

        if (
            typeof body.fileName !== "string" ||
            typeof body.contentType !== "string" ||
            typeof body.fileSize !== "number"
        ) {
            return NextResponse.json(
                { success: false, message: "Invalid upload details." },
                { status: 400 }
            );
        }

        const result = await createUploadUrl(body.kind, {
            fileName: body.fileName,
            contentType: body.contentType,
            fileSize: body.fileSize,
        });

        return NextResponse.json({
            success: true,
            uploadUrl: result.uploadUrl,
            objectKey: result.objectKey,
        });
    } catch (error) {
        console.error("Upload URL creation failed:", error);

        return NextResponse.json(
            { success: false, message: "Could not create upload URL." },
            { status: 400 }
        );
    }
}
