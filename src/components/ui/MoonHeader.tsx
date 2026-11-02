interface MoonHeaderProps {
  size?: number;
}

export default function MoonHeader({ size = 52 }: MoonHeaderProps) {
  return (
    <div
      style={{
        position: "relative",
        width: `${size}px`,
        height: `${size}px`,
        userSelect: "none",
        pointerEvents: "none",
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="moonSoftGlow" cx="50%" cy="45%" r="50%">
            <stop offset="0%" stopColor="#fff8e8" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#fff8e8" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Soft Ambient Glow */}
        <circle cx="50" cy="46" r="44" fill="url(#moonSoftGlow)" />

        {/* Crescent Moon matching the mockup */}
        <path
          d="M 54 18 C 36 18 22 32 22 50 C 22 68 36 82 54 82 C 60 82 66 80 71 77 C 56 74 45 61 45 46 C 45 32 54 21 68 19 C 63 18 59 18 54 18 Z"
          fill="#f0ebd9"
          stroke="#dfd7c2"
          strokeWidth="1.2"
        />

        {/* Subtle sketch cloud below moon */}
        <path
          d="M 16 75 C 20 68 30 68 36 72 C 44 66 58 66 66 71 C 74 67 86 68 89 75 C 92 82 85 86 80 86 L 24 86 C 18 86 13 81 16 75 Z"
          stroke="rgba(225, 220, 205, 0.4)"
          strokeWidth="1.2"
          strokeDasharray="2 1"
          fill="none"
        />

        {/* Tiny twinkle star */}
        <circle cx="86" cy="30" r="1.5" fill="#ffffff" opacity="0.8" />
        <circle cx="15" cy="45" r="1" fill="#ffffff" opacity="0.5" />
      </svg>
    </div>
  );
}
