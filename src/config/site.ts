export const siteConfig = {
    name: "VULP",
    title: "VULP — Music for your moments",
    description:
        "A personal space for curated music and unforgettable sounds.",

    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

    creator: "VULP",

    links: {
        home: "/",
        admin: "/admin",
    },

    player: {
        defaultVolume: 1,
        preload: "metadata" as const,
        autoPlayNext: true,
        showQueue: false,
    },

    upload: {
        maxAudioSize: 100 * 1024 * 1024,
        maxArtworkSize: 10 * 1024 * 1024,
    },
} as const;