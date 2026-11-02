"use client";

interface WaveformProps {
  isPlaying?: boolean;
}

const STATIC_BAR_HEIGHTS = [
  14, 18, 16, 22, 20, 26, 24, 32, 28, 40,
  36, 50, 44, 60, 52, 70, 62, 82, 74, 92,
  86, 100, 92, 96, 88, 80, 72, 78, 64, 70,
  56, 62, 48, 54, 40, 46, 32, 38, 26, 32,
  20, 24, 16, 18
];

const STATIC_BAR_OPACITIES = STATIC_BAR_HEIGHTS.map((h) =>
  Number((0.3 + (h / 100) * 0.6).toFixed(2))
);

export default function Waveform({ isPlaying = false }: WaveformProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "36px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "2px",
        padding: "0 4px",
        overflow: "hidden",
        userSelect: "none",
      }}
      aria-hidden="true"
    >
      {STATIC_BAR_HEIGHTS.map((h, i) => {
        const animDuration = 0.5 + ((i % 5) * 0.14);
        const animDelay = (i % 7) * 0.08;

        return (
          <div
            key={i}
            style={{
              flex: 1,
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                width: "1.6px",
                height: `${h}%`,
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                borderRadius: "9999px",
                opacity: STATIC_BAR_OPACITIES[i],
                animation: isPlaying
                  ? `wavePulse ${animDuration}s ease-in-out ${animDelay}s infinite alternate`
                  : "none",
                display: "block",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
