import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { detectTrackSource } from "./source-detector.ts";

describe("detectTrackSource", () => {
    it("detects YouTube links", () => {
        const result = detectTrackSource(
            "https://youtu.be/dQw4w9WgXcQ"
        );

        assert.equal(result.sourceType, "youtube");
        assert.equal(result.sourceId, "dQw4w9WgXcQ");
        assert.equal(
            result.sourceUrl,
            "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        );
    });

    it("detects Spotify track links", () => {
        const result = detectTrackSource(
            "https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC"
        );

        assert.equal(result.sourceType, "spotify");
        assert.equal(result.sourceId, "4uLU6hMCjMI75M1A2tKUQC");
        assert.equal(
            result.sourceUrl,
            "https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC"
        );
    });

    it("detects direct audio file URLs", () => {
        const result = detectTrackSource(
            "https://cdn.example.com/audio/song.mp3"
        );

        assert.equal(result.sourceType, "direct_url");
        assert.equal(result.sourceId, "https://cdn.example.com/audio/song.mp3");
    });

    it("rejects unsupported URLs", () => {
        assert.throws(() => {
            detectTrackSource("https://example.com");
        });
    });
});
