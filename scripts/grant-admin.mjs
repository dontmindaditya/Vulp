import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// Load .env.local if environment variables are not preloaded
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    if (fs.existsSync(".env.local")) {
        const envConfig = fs.readFileSync(".env.local", "utf8");
        envConfig.split("\n").forEach((line) => {
            const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
            if (match) {
                const key = match[1];
                const value = match[2].trim().replace(/^['"]|['"]$/g, "");
                if (!process.env[key]) {
                    process.env[key] = value;
                }
            }
        });
    }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Use the exact user ID shown in your Supabase user details.
const userId = "e237e4d8-c458-4c20-9a2b-9ce1483f9ca2";

if (!supabaseUrl || !serviceKey) {
    throw new Error("Missing Supabase URL or server secret key.");
}

const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

async function grantAdmin() {
    const { data: existing, error: fetchError } =
        await supabase.auth.admin.getUserById(userId);

    if (fetchError || !existing.user) {
        throw fetchError ?? new Error("User not found.");
    }

    const { data, error } = await supabase.auth.admin.updateUserById(
        userId,
        {
            app_metadata: {
                ...existing.user.app_metadata,
                role: "admin",
            },
        }
    );

    if (error) {
        throw error;
    }

    console.log("Admin role assigned successfully.");
    console.log("Email:", data.user.email);
    console.log("App metadata:", data.user.app_metadata);
}

grantAdmin().catch((error) => {
    console.error("Admin setup failed:", error.message);
    process.exitCode = 1;
});

