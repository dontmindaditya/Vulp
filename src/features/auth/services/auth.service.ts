import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface AdminUser {
    id: string;
    email: string;
}

export async function getAdminUser(): Promise<AdminUser | null> {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.getClaims();

    if (error || !data?.claims) {
        return null;
    }

    const claims = data.claims;
    const appMetadata = claims.app_metadata as
        | { role?: string }
        | undefined;

    // Only users with a trusted admin role can enter.
    if (appMetadata?.role !== "admin") {
        return null;
    }

    if (typeof claims.sub !== "string") {
        return null;
    }

    return {
        id: claims.sub,
        email: typeof claims.email === "string"
            ? claims.email
            : "",
    };
}

export async function requireAdmin(): Promise<AdminUser> {
    const user = await getAdminUser();

    if (!user) {
        redirect("/admin/login");
    }

    return user;
}
