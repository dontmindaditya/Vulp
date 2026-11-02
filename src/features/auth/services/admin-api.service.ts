import "server-only";

import { NextResponse } from "next/server";
import { getAdminUser } from "@/features/auth/services/auth.service";

export async function authorizeAdminApi() {
    const admin = await getAdminUser();

    if (!admin) {
        return {
            admin: null,
            response: NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            ),
        };
    }

    return {
        admin,
        response: null,
    };
}

