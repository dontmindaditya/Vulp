"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface AuthActionState {
    error: string | null;
}

export async function signInAction(
    _previousState: AuthActionState,
    formData: FormData
): Promise<AuthActionState> {
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
        return { error: "Please enter your email and password." };
    }

    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { error: "Invalid email or password." };
    }

    // Verify that the signed-in account is actually an admin.
    const { data, error: claimsError } =
        await supabase.auth.getClaims();

    const appMetadata = data?.claims?.app_metadata as
        | { role?: string }
        | undefined;

    const role = appMetadata?.role;

    if (claimsError || role !== "admin") {
        await supabase.auth.signOut();

        return {
            error: "This account is not authorized to access VULP Admin.",
        };
    }

    redirect("/admin");
}

export async function signOutAction() {
    const supabase = await createClient();

    await supabase.auth.signOut();

    redirect("/admin/login");
}

